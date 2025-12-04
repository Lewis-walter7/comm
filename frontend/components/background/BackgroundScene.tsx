'use client';

import { useRef, useState, useEffect } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { Particles } from './Particles';
import { NetworkMesh } from './NetworkMesh';
import { Lights } from './Lights';
import { BackgroundSceneProps } from './types';

function Scene({
    intensity = 0.7,
    speed = 1,
    opacity = 0.8,
    particleCount = 200,
    networkNodes = 8,
    enableParallax = true,
}: BackgroundSceneProps) {
    return (
        <>
            <CameraController enableParallax={enableParallax} />
            <Lights intensity={intensity} />
            <Particles count={particleCount} speed={speed} opacity={opacity * 0.75} />
            <NetworkMesh nodeCount={networkNodes} speed={speed} opacity={opacity * 0.6} />
        </>
    );
}

function CameraController({ enableParallax }: { enableParallax: boolean }) {
    const { camera } = useThree();
    const mouse = useRef({ x: 0, y: 0 });

    useEffect(() => {
        if (!enableParallax) return;

        const handleMouseMove = (event: MouseEvent) => {
            // Normalize mouse position to -1 to 1
            mouse.current.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.current.y = -(event.clientY / window.innerHeight) * 2 + 1; // Invert Y for Three.js
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [enableParallax]);

    useFrame(() => {
        if (enableParallax) {
            // Smoothly interpolate camera position towards mouse position
            camera.position.x += (mouse.current.x * 2 - camera.position.x) * 0.05;
            camera.position.y += (mouse.current.y * 2 - camera.position.y) * 0.05;
            camera.lookAt(0, 0, 0); // Keep camera looking at the center
        }
    });

    return null;
}

export function BackgroundScene(props: BackgroundSceneProps) {
    const [mounted, setMounted] = useState(false);

    // Only render on client to avoid SSR issues
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: -1,
                background: 'linear-gradient(to bottom, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
                opacity: props.opacity ?? 0.8,
            }}
        >
            <Canvas
                camera={{ position: [0, 0, 20], fov: 60 }}
                dpr={[1, 2]} // Adaptive pixel ratio for performance
                performance={{ min: 0.5 }} // Throttle if performance drops
                gl={{
                    antialias: false, // Disable for better performance
                    alpha: true,
                    powerPreference: 'high-performance',
                }}
            >
                <Scene {...props} />
            </Canvas>
        </div>
    );
}
