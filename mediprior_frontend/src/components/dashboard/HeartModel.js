// src/components/dashboard/HeartModel.js
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';

/*
This component loads your 3D model.
It assumes you have a file named 'heart_model.glb'
in your /public folder.
*/
function Model() {
    // 1. This line loads your model.
    // Make sure the path '/heart_model.glb' matches your file name.
    const { scene } = useGLTF('/heart_model.glb');
    
    // 2. This scales and positions the model in the scene.
    // You will need to change these numbers to fit your model.
    return <primitive 
        object={scene} 
        scale={1.5} // Example: make it 1.5x bigger
        position={[0, -1, 0]} // Example: move it down 1 unit
    />;
}

function HeartModel() {
    return (
        <Card className="theme-card h-100" style={{ minHeight: '400px' }}>
            <Card.Body>
                {/* 3. The Canvas is your 3D "stage" */}
                <Canvas camera={{ position: [0, 0, 3], fov: 70 }}>
                    {/* 4. This adds lighting */}
                    <ambientLight intensity={0.5} />
                    <directionalLight position={[10, 10, 5]} intensity={1} />
                    
                    {/* 5. Suspense is a "loader" for React to
                           wait for the model to download */}
                    <Suspense fallback={null}>
                        <Model />
                    </Suspense>
                    
                    {/* 6. This lets you spin the model with your mouse */}
                    <OrbitControls enableZoom={false} autoRotate={true} />
                </Canvas>
            </Card.Body>
        </Card>
    );
}

// 7. We need to import Card
import { Card } from 'react-bootstrap';
export default HeartModel;