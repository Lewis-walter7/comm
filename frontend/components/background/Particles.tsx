'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ParticlesProps } from './types';

export function Particles({ count = 200, speed = 1, opacity = 0.6 }: ParticlesProps) {
    const pointsRef = useRef<THREE.Points>(null);

    // Generate particle positions and velocities
    const particlesData = useMemo(() => {
        const positions = new Float32Array(count * 3);
        const velocities = new Float32Array(count * 3);
        const sizes = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            const i3 = i * 3;

            // Random positions in a large sphere
            positions[i3] = (Math.random() - 0.5) * 30;
            positions[i3 + 1] = (Math.random() - 0.5) * 30;
            positions[i3 + 2] = (Math.random() - 0.5) * 30;

            // Random velocities for organic movement
            velocities[i3] = (Math.random() - 0.5) * 0.02;
            velocities[i3 + 1] = (Math.random() - 0.5) * 0.02;
            velocities[i3 + 2] = (Math.random() - 0.5) * 0.02;

            // Random sizes
            sizes[i] = Math.random() * 0.5 + 0.2;
        }

        return { positions, velocities, sizes };
    }, [count]);

    // Animate particles
    useFrame((state, delta) => {
        if (!pointsRef.current) return;

        const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;

        for (let i = 0; i < count; i++) {
            const i3 = i * 3;

            // Apply velocity with speed multiplier
            positions[i3] += particlesData.velocities[i3] * speed;
            positions[i3 + 1] += particlesData.velocities[i3 + 1] * speed;
            positions[i3 + 2] += particlesData.velocities[i3 + 2] * speed;

            // Wrap around boundaries (creates infinite effect)
            if (Math.abs(positions[i3]) > 15) positions[i3] *= -1;
            if (Math.abs(positions[i3 + 1]) > 15) positions[i3 + 1] *= -1;
            if (Math.abs(positions[i3 + 2]) > 15) positions[i3 + 2] *= -1;
        }

        pointsRef.current.geometry.attributes.position.needsUpdate = true;

        // Subtle rotation for added depth
        pointsRef.current.rotation.y += delta * 0.01 * speed;
    });

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    args={[particlesData.positions, 3]}
                />
                <bufferAttribute
                    attach="attributes-size"
                    args={[particlesData.sizes, 1]}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.1}
                color="#60a5fa"
                transparent
                opacity={opacity}
                sizeAttenuation
                blending={THREE.AdditiveBlending}
                depthWrite={false}
            />
        </points>
    );
}
