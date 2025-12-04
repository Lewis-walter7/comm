'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { LightsProps } from './types';

export function Lights({ intensity = 0.7 }: LightsProps) {
    const pointLight1Ref = useRef<THREE.PointLight>(null);
    const pointLight2Ref = useRef<THREE.PointLight>(null);

    // Animate point lights with pulsing effect
    useFrame((state) => {
        const time = state.clock.elapsedTime;

        if (pointLight1Ref.current) {
            pointLight1Ref.current.intensity = intensity * (0.6 + Math.sin(time * 2) * 0.4);
        }

        if (pointLight2Ref.current) {
            pointLight2Ref.current.intensity = intensity * (0.6 + Math.sin(time * 2 + Math.PI) * 0.4);
        }
    });

    return (
        <>
            {/* Ambient light for base illumination */}
            <ambientLight intensity={intensity * 0.3} color="#1e293b" />

            {/* Directional lights for depth */}
            <directionalLight
                position={[5, 5, 5]}
                intensity={intensity * 0.4}
                color="#3b82f6"
            />
            <directionalLight
                position={[-5, -5, -5]}
                intensity={intensity * 0.2}
                color="#60a5fa"
            />

            {/* Pulsing point lights representing active connections */}
            <pointLight
                ref={pointLight1Ref}
                position={[10, 10, -10]}
                color="#3b82f6"
                intensity={intensity}
                distance={30}
            />
            <pointLight
                ref={pointLight2Ref}
                position={[-10, -10, 10]}
                color="#60a5fa"
                intensity={intensity}
                distance={30}
            />
        </>
    );
}
