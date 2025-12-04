'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { NetworkMeshProps } from './types';

export function NetworkMesh({ nodeCount = 8, speed = 1, opacity = 0.5 }: NetworkMeshProps) {
    const nodesRef = useRef<THREE.Group>(null);
    const linesRef = useRef<THREE.LineSegments>(null);

    // Generate node positions
    const nodePositions = useMemo(() => {
        const positions: THREE.Vector3[] = [];

        for (let i = 0; i < nodeCount; i++) {
            // Distribute nodes in a sphere with some clustering
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const radius = 8 + Math.random() * 4;

            positions.push(
                new THREE.Vector3(
                    radius * Math.sin(phi) * Math.cos(theta),
                    radius * Math.sin(phi) * Math.sin(theta),
                    radius * Math.cos(phi)
                )
            );
        }

        return positions;
    }, [nodeCount]);

    // Generate connections based on proximity
    const connections = useMemo(() => {
        const lines: [number, number][] = [];
        const maxDistance = 10;

        for (let i = 0; i < nodePositions.length; i++) {
            for (let j = i + 1; j < nodePositions.length; j++) {
                const distance = nodePositions[i].distanceTo(nodePositions[j]);
                if (distance < maxDistance) {
                    lines.push([i, j]);
                }
            }
        }

        return lines;
    }, [nodePositions]);

    // Create line geometry
    const lineGeometry = useMemo(() => {
        const positions: number[] = [];

        connections.forEach(([i, j]) => {
            positions.push(
                nodePositions[i].x, nodePositions[i].y, nodePositions[i].z,
                nodePositions[j].x, nodePositions[j].y, nodePositions[j].z
            );
        });

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

        return geometry;
    }, [connections, nodePositions]);

    // Animate nodes and lines
    useFrame((state) => {
        if (!nodesRef.current || !linesRef.current) return;

        const time = state.clock.elapsedTime * speed;

        // Pulse nodes
        nodesRef.current.children.forEach((node, i) => {
            const pulse = Math.sin(time * 2 + i) * 0.5 + 0.5;
            node.scale.setScalar(0.8 + pulse * 0.4);
        });

        // Pulse line opacity
        const lineMaterial = linesRef.current.material as THREE.LineBasicMaterial;
        lineMaterial.opacity = opacity * (0.7 + Math.sin(time) * 0.3);

        // Subtle rotation
        nodesRef.current.rotation.y = time * 0.1;
    });

    return (
        <group>
            {/* Connection lines */}
            <lineSegments ref={linesRef} geometry={lineGeometry}>
                <lineBasicMaterial
                    color="#3b82f6"
                    transparent
                    opacity={opacity}
                    blending={THREE.AdditiveBlending}
                />
            </lineSegments>

            {/* Network nodes */}
            <group ref={nodesRef}>
                {nodePositions.map((pos, i) => (
                    <mesh key={i} position={pos}>
                        <sphereGeometry args={[0.15, 8, 8]} />
                        <meshBasicMaterial
                            color="#60a5fa"
                            transparent
                            opacity={opacity * 1.5}
                        />
                        {/* Glow effect */}
                        <mesh>
                            <sphereGeometry args={[0.25, 8, 8]} />
                            <meshBasicMaterial
                                color="#3b82f6"
                                transparent
                                opacity={opacity * 0.3}
                                blending={THREE.AdditiveBlending}
                            />
                        </mesh>
                    </mesh>
                ))}
            </group>
        </group>
    );
}
