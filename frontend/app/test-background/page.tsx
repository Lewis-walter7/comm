'use client';

import { BackgroundScene } from '@/components/background';
import { useState } from 'react';

export default function BackgroundTestPage() {
    const [intensity, setIntensity] = useState(0.7);
    const [speed, setSpeed] = useState(1);
    const [opacity, setOpacity] = useState(0.8);
    const [particleCount, setParticleCount] = useState(200);
    const [networkNodes, setNetworkNodes] = useState(8);
    const [enableParallax, setEnableParallax] = useState(true);

    return (
        <div className="min-h-screen">
            <BackgroundScene
                intensity={intensity}
                speed={speed}
                opacity={opacity}
                particleCount={particleCount}
                networkNodes={networkNodes}
                enableParallax={enableParallax}
            />

            {/* Control Panel */}
            <div className="relative z-10 p-8">
                <div className="max-w-2xl mx-auto bg-slate-900/80 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-slate-700">
                    <h1 className="text-3xl font-bold text-white mb-2">
                        3D Background Scene Test
                    </h1>
                    <p className="text-slate-300 mb-8">
                        Adjust the controls below to customize the background scene
                    </p>

                    <div className="space-y-6">
                        {/* Intensity Control */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Intensity: {intensity.toFixed(2)}
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={intensity}
                                onChange={(e) => setIntensity(parseFloat(e.target.value))}
                                className="w-full"
                            />
                        </div>

                        {/* Speed Control */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Speed: {speed.toFixed(1)}x
                            </label>
                            <input
                                type="range"
                                min="0.1"
                                max="3"
                                step="0.1"
                                value={speed}
                                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                                className="w-full"
                            />
                        </div>

                        {/* Opacity Control */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Opacity: {opacity.toFixed(2)}
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={opacity}
                                onChange={(e) => setOpacity(parseFloat(e.target.value))}
                                className="w-full"
                            />
                        </div>

                        {/* Particle Count Control */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Particle Count: {particleCount}
                            </label>
                            <input
                                type="range"
                                min="50"
                                max="500"
                                step="50"
                                value={particleCount}
                                onChange={(e) => setParticleCount(parseInt(e.target.value))}
                                className="w-full"
                            />
                        </div>

                        {/* Network Nodes Control */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Network Nodes: {networkNodes}
                            </label>
                            <input
                                type="range"
                                min="4"
                                max="16"
                                step="1"
                                value={networkNodes}
                                onChange={(e) => setNetworkNodes(parseInt(e.target.value))}
                                className="w-full"
                            />
                        </div>

                        {/* Parallax Toggle */}
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="parallax"
                                checked={enableParallax}
                                onChange={(e) => setEnableParallax(e.target.checked)}
                                className="mr-3"
                            />
                            <label htmlFor="parallax" className="text-sm font-medium text-slate-300">
                                Enable Parallax Effect
                            </label>
                        </div>

                        {/* Reset Button */}
                        <button
                            onClick={() => {
                                setIntensity(0.7);
                                setSpeed(1);
                                setOpacity(0.8);
                                setParticleCount(200);
                                setNetworkNodes(8);
                                setEnableParallax(true);
                            }}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                        >
                            Reset to Defaults
                        </button>
                    </div>

                    {/* Info Section */}
                    <div className="mt-8 pt-6 border-t border-slate-700">
                        <h3 className="text-lg font-semibold text-white mb-3">Features</h3>
                        <ul className="space-y-2 text-sm text-slate-300">
                            <li>✨ Floating particles with organic movement</li>
                            <li>🌐 Connected network mesh with pulsing nodes</li>
                            <li>💡 Dynamic lighting with subtle animations</li>
                            <li>🎯 Mouse parallax camera movement</li>
                            <li>⚡ Optimized for 60fps performance</li>
                        </ul>
                    </div>
                </div>

                {/* Usage Example */}
                <div className="max-w-2xl mx-auto mt-8 bg-slate-900/80 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-slate-700">
                    <h2 className="text-xl font-bold text-white mb-4">Usage Example</h2>
                    <pre className="bg-slate-950 text-slate-300 p-4 rounded-lg overflow-x-auto text-sm">
                        {`import { BackgroundScene } from '@/components/background';

export default function Page() {
  return (
    <div className="relative min-h-screen">
      <BackgroundScene
        intensity={${intensity.toFixed(1)}}
        speed={${speed.toFixed(1)}}
        opacity={${opacity.toFixed(1)}}
        particleCount={${particleCount}}
        networkNodes={${networkNodes}}
        enableParallax={${enableParallax}}
      />
      
      <div className="relative z-10">
        {/* Your content here */}
      </div>
    </div>
  );
}`}
                    </pre>
                </div>
            </div>
        </div>
    );
}
