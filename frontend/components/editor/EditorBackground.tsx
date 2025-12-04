'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { Suspense } from 'react';

interface EditorBackgroundProps {
    opacity?: number;
}

function WaveParticles() {
    return (
        <>
            {/* Ambient stars */}
            <Stars radius={100} depth={50} count={2000} factor={2} saturation={0} fade speed={0.5} />

            {/* Soft ambient light */}
            <ambientLight intensity={0.2} />
            <pointLight position={[10, 10, 10]} intensity={0.3} color="#8b5cf6" />
            <pointLight position={[-10, -10, 10]} intensity={0.3} color="#3b82f6" />
        </>
    );
}

export default function EditorBackground({ opacity = 0.2 }: EditorBackgroundProps) {
    return (
        <div className="absolute inset-0 pointer-events-none" style={{ opacity }}>
            <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
                <Suspense fallback={null}>
                    <WaveParticles />
                    <OrbitControls
                        enableZoom={false}
                        enablePan={false}
                        autoRotate
                        autoRotateSpeed={0.2}
                    />
                </Suspense>
            </Canvas>
        </div>
    );
}
