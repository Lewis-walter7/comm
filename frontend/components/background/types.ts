export interface BackgroundSceneProps {
    intensity?: number;
    speed?: number;
    opacity?: number;
    particleCount?: number;
    networkNodes?: number;
    enableParallax?: boolean;
}

export interface ParticlesProps {
    count?: number;
    speed?: number;
    opacity?: number;
}

export interface NetworkMeshProps {
    nodeCount?: number;
    speed?: number;
    opacity?: number;
}

export interface LightsProps {
    intensity?: number;
}
