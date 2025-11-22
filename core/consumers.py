# core/consumers.py
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from asgiref.sync import async_to_sync
from .models import Conversation, Message, User, DoctorPatientConnection, DoctorProfile
from django.db.models import Count

class ChatConsumer(AsyncWebsocketConsumer):
    # ... (connect, disconnect, receive, chat_message are unchanged) ...
    async def connect(self):
        self.user = self.scope['user']
        if not self.user or self.user.is_anonymous:
            await self.close()
            return
        self.connection_id = self.scope['url_route']['kwargs']['connection_id']
        self.room_group_name = f'chat_{self.connection_id}'

        if not await self.is_user_participant(self.user, self.connection_id):
            await self.close()
            return

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()
        await self.send_message_history()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        
        # --- 1. HANDLE CLEAR HISTORY (SOFT DELETE) ---
        if data.get('command') == 'clear_history':
            await self.soft_delete_history()
            # Send 'cleared' event ONLY to the user who cleared it
            await self.send(text_data=json.dumps({'type': 'cleared'}))
            return

        message_content = data.get('message', '').strip()
        if not message_content: return

        if self.user.user_type == 'PATIENT':
            check = await self.check_spam_rules(message_content)
            if check['blocked']:
                await self.send(text_data=json.dumps({'type': 'error', 'code': check['code'], 'message': check['message']}))
                return 

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

    # --- Logic Helpers (Unchanged) ---
    @database_sync_to_async
    def check_spam_rules(self, new_content):
        # ... (Same spam logic as before) ...
        try:
            connection = DoctorPatientConnection.objects.get(id=self.connection_id)
            doctor_profile = connection.doctor.doctor_profile
            if doctor_profile.chat_status == 'BUSY': return {'blocked': True, 'code': 'busy', 'message': "Doctor is currently unavailable."}
            if doctor_profile.chat_status == 'OFFLINE': return {'blocked': True, 'code': 'offline', 'message': "Doctor is currently Offline."}
            
            conversation = self._get_conversation_sync()
            last_messages = conversation.messages.order_by('-timestamp')[:5]
            if last_messages and last_messages[0].sender == self.user:
                if last_messages[0].content.lower() == new_content.lower(): return {'blocked': True, 'code': 'spam', 'message': "Repetitive message."}
            consecutive = 0
            for msg in last_messages:
                if msg.sender == self.user: consecutive += 1
                else: break
            if consecutive >= 5: return {'blocked': True, 'code': 'limit_reached', 'message': "Please wait for response."}
            return {'blocked': False}
        except: return {'blocked': False}

    def _get_conversation_sync(self):
        connection = DoctorPatientConnection.objects.get(id=self.connection_id)
        conversation = Conversation.objects.annotate(count=Count('participants')).filter(count=2, participants=connection.patient).filter(participants=connection.doctor).first()
        if not conversation:
            conversation = Conversation.objects.create()
            conversation.participants.set([connection.patient, connection.doctor])
            conversation.save()
        return conversation

    @database_sync_to_async
    def get_conversation(self): return self._get_conversation_sync()

    @database_sync_to_async
    def is_user_participant(self, user, connection_id):
        try:
            connection = DoctorPatientConnection.objects.get(id=connection_id)
            return user == connection.patient or user == connection.doctor
        except: return False

    # --- UPDATED: Filter deleted messages ---
    @database_sync_to_async
    def send_message_history(self):
        conversation = async_to_sync(self.get_conversation)()
        if not conversation: return
        
        # Exclude messages where the current user is in the 'deleted_by' list
        messages = conversation.messages.exclude(deleted_by=self.user).order_by('timestamp')
        
        message_list = []
        for msg in messages:
            message_list.append({'type': 'message', 'message': msg.content, 'sender_id': msg.sender.id, 'timestamp': msg.timestamp.isoformat()})
        async_to_sync(self.send)(text_data=json.dumps({'type': 'history', 'messages': message_list}))

    @database_sync_to_async
    def create_new_message(self, content):
        conversation = async_to_sync(self.get_conversation)()
        return Message.objects.create(conversation=conversation, sender=self.user, content=content)

    # --- NEW: Soft Delete ---
    @database_sync_to_async
    def soft_delete_history(self):
        conversation = async_to_sync(self.get_conversation)()
        if conversation:
            for msg in conversation.messages.all():
                msg.deleted_by.add(self.user)