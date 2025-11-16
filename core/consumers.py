# core/consumers.py
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from asgiref.sync import async_to_sync
from .models import Conversation, Message, User, DoctorPatientConnection
from django.contrib.auth.models import AnonymousUser
from django.db.models import Count

class ChatConsumer(AsyncWebsocketConsumer):
    
    async def connect(self):
        self.user = self.scope['user']
        
        if self.user.is_anonymous:
            await self.close()
            return
            
        self.connection_id = self.scope['url_route']['kwargs']['connection_id']
        self.room_group_name = f'chat_{self.connection_id}'

        is_participant = await self.is_user_participant(self.user, self.connection_id)
        if not is_participant:
            await self.close()
            return

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()
        await self.send_message_history()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_content = data['message']
        
        new_message = await self.create_new_message(message_content)

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': new_message.content,
                'sender_id': self.user.id,
                'timestamp': new_message.timestamp.isoformat(),
            }
        )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'type': 'message',
            'message': event['message'],
            'sender_id': event['sender_id'],
            'timestamp': event['timestamp'],
        }))

    # --- Database Helper Functions ---
    
    @database_sync_to_async
    def get_conversation(self):
        """
        Helper function to find or create the 1-on-1 conversation.
        """
        try:
            connection = DoctorPatientConnection.objects.get(id=self.connection_id)
            patient = connection.patient
            doctor = connection.doctor

            # --- THIS IS THE FIX ---
            # Find a conversation that has *exactly* these two people
            conversation = Conversation.objects.annotate(
                count=Count('participants')
            ).filter(
                count=2, # Ensure it's only a 1-on-1 chat
                participants=patient
            ).filter(
                participants=doctor
            ).first()
            # --- END OF FIX ---

            if conversation:
                # We found the existing 1-on-1 chat
                return conversation
            else:
                # This is their first time chatting, create a new conversation
                new_convo = Conversation.objects.create()
                new_convo.participants.set([patient, doctor]) # Use .set() for ManyToMany
                new_convo.save()
                return new_convo
                
        except DoctorPatientConnection.DoesNotExist:
            return None

    @database_sync_to_async
    def is_user_participant(self, user, connection_id):
        try:
            connection = DoctorPatientConnection.objects.get(id=connection_id)
            return user == connection.patient or user == connection.doctor
        except DoctorPatientConnection.DoesNotExist:
            return False

    @database_sync_to_async
    def send_message_history(self):
        conversation = async_to_sync(self.get_conversation)()
        if conversation is None:
            async_to_sync(self.close)()
            return
            
        messages = conversation.messages.all().order_by('timestamp')
        message_list = []
        for msg in messages:
            message_list.append({
                'type': 'message',
                'message': msg.content,
                'sender_id': msg.sender.id,
                'timestamp': msg.timestamp.isoformat(),
            })
        
        async_to_sync(self.send)(text_data=json.dumps({
            'type': 'history',
            'messages': message_list
        }))

    @database_sync_to_async
    def create_new_message(self, content):
        conversation = async_to_sync(self.get_conversation)()
        
        message = Message.objects.create(
            conversation=conversation,
            sender=self.user,
            content=content
        )
        return message