# React Three Fiber Background Scene

A modern, futuristic 3D background scene for secure real-time collaboration dashboards.

## Features

- ✨ **Floating Particles** - Slow, organic movement with configurable count and speed
- 🌐 **Network Mesh** - Connected nodes with glowing lines representing secure connections
- 💡 **Dynamic Lighting** - Pulsing point lights with ambient and directional illumination
- 🎯 **Parallax Effect** - Subtle camera movement following mouse position
- ⚡ **Performance Optimized** - Low-poly geometry, instanced rendering, adaptive quality
- 🎨 **Fully Customizable** - Expose props for intensity, speed, opacity, and more

## Theme

**"Secure. Real-time. Premium. Minimalistic tech."**

Inspired by Microsoft Teams, Linear, and Google Drive — clean, minimal, with subtle premium animations.

## Installation

All dependencies are already installed:
- `@react-three/fiber` - React renderer for Three.js
- `@react-three/drei` - Useful helpers for R3F
- `three` - 3D library

## Usage

### Basic Usage

```tsx
import { BackgroundScene } from '@/components/background';

export default function Page() {
  return (
    <div className="relative min-h-screen">
      <BackgroundScene />
      
      {/* Your UI content here */}
      <div className="relative z-10">
        <h1>Your Dashboard</h1>
      </div>
    </div>
  );
}
```

### With Custom Props

```tsx
<BackgroundScene
  intensity={0.8}        // Overall brightness (0-1)
  speed={1.5}            // Animation speed multiplier
  opacity={0.7}          // Overall opacity (0-1)
  particleCount={300}    // Number of floating particles
  networkNodes={12}      // Number of network nodes
  enableParallax={true}  // Enable mouse parallax effect
/>
```

### Minimal Configuration

```tsx
<BackgroundScene
  opacity={0.5}
  particleCount={100}
  networkNodes={6}
/>
```

## Component Structure

```
components/background/
├── BackgroundScene.tsx   # Main component (use this)
├── Particles.tsx        # Floating particles system
├── NetworkMesh.tsx      # Connected nodes network
├── Lights.tsx           # Scene lighting
├── types.ts             # TypeScript interfaces
└── index.ts             # Barrel exports
```

## Props Reference

### BackgroundSceneProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `intensity` | `number` | `0.7` | Overall scene brightness (0-1) |
| `speed` | `number` | `1` | Animation speed multiplier |
| `opacity` | `number` | `0.8` | Overall scene opacity (0-1) |
| `particleCount` | `number` | `200` | Number of floating particles |
| `networkNodes` | `number` | `8` | Number of network nodes |
| `enableParallax` | `boolean` | `true` | Enable camera parallax on mouse move |

## Performance

The scene is optimized for dashboard use with:
- **Low-poly geometry** - Simple shapes for nodes and connections
- **Instanced rendering** - Efficient particle system using Points
- **Adaptive pixel ratio** - Adjusts based on device capabilities
- **Throttled animations** - Uses delta time for smooth 60fps
- **No antialiasing** - Disabled for better performance
- **SSR safe** - Only renders on client side

## Visual Design

- **Dark gradient background** - Deep navy (#0f172a to #1e293b)
- **Blue accent colors** - Professional blue tones (#3b82f6, #60a5fa)
- **Subtle animations** - No heavy neon or chaotic effects
- **Additive blending** - Creates soft glow effects
- **Minimal distraction** - Enhances UI without overwhelming

## Browser Compatibility

Works in all modern browsers that support WebGL:
- Chrome 56+
- Firefox 51+
- Safari 11+
- Edge 79+

## Tips

1. **Keep it subtle** - Use lower opacity (0.5-0.7) to avoid overwhelming UI
2. **Reduce on mobile** - Consider disabling or reducing particle count on mobile devices
3. **Layer properly** - Ensure your UI content has `position: relative` and higher `z-index`
4. **Test performance** - Monitor FPS on target devices and adjust accordingly

## Example Integration in Dashboard

```tsx
'use client';

import { BackgroundScene } from '@/components/background';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <BackgroundScene opacity={0.6} />
      
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
```
