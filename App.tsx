import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AnimationData } from './types';
import { generateAnimation } from './services/geminiService';
import PixelCanvas from './components/PixelCanvas';
import ColorPalette from './components/ColorPalette';

const App: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('a flower sprouting and blooming');
  const [model, setModel] = useState<string>('gemini-2.5-flash');
  const [animationData, setAnimationData] = useState<AnimationData | null>(null);
  const [currentFrameIndex, setCurrentFrameIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isDitheringEnabled, setIsDitheringEnabled] = useState<boolean>(false);

  const animationIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (animationIntervalRef.current) {
      clearInterval(animationIntervalRef.current);
    }

    if (animationData && animationData.frames.length > 0) {
      animationIntervalRef.current = window.setInterval(() => {
        setCurrentFrameIndex((prevIndex) => (prevIndex + 1) % animationData.frames.length);
      }, animationData.cadenceMs);
    }
    
    return () => {
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current);
      }
    };
  }, [animationData]);
  
  const handleGenerate = useCallback(async () => {
    if (!prompt || isLoading) return;

    setIsLoading(true);
    setError(null);
    setAnimationData(null);
    setCurrentFrameIndex(0);

    try {
      const data = await generateAnimation(prompt, model);
      setAnimationData(data);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [prompt, isLoading, model]);
  
  const handleDownload = () => {
    if (!animationData) return;

    const { frames, palette } = animationData;
    const frameSize = 16;
    const pixelSize = 1; // Each pixel on the spritesheet is 1x1

    const canvas = document.createElement('canvas');
    canvas.width = frameSize * frames.length * pixelSize;
    canvas.height = frameSize * pixelSize;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    frames.forEach((frame, frameIndex) => {
      for (let y = 0; y < frameSize; y++) {
        for (let x = 0; x < frameSize; x++) {
          const colorIndex = frame[y]?.[x];
          if (colorIndex !== undefined && palette[colorIndex]) {
            ctx.fillStyle = palette[colorIndex];
            ctx.fillRect(
              (frameIndex * frameSize + x) * pixelSize,
              y * pixelSize,
              pixelSize,
              pixelSize
            );
          }
        }
      }
    });

    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    const safeFilename = prompt.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 30);
    link.download = `${safeFilename || 'animation'}-spritesheet.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const currentFrame = animationData ? animationData.frames[currentFrameIndex] : null;

  return (
    <div className="min-h-screen bg-[#0D0D10] flex items-center justify-center p-4 font-sans text-[#B0B0B0]">
      <main className="w-full max-w-2xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center md:text-left">
          <div className="inline-block px-3 py-1 text-xs font-medium tracking-wider text-[#8A8A8A] bg-[#1A1A1E] border border-[#606065] rounded-full">
            PIXEL BLOOM
          </div>
          <h1 className="mt-4 text-4xl md:text-5xl font-bold tracking-tight text-white">
            Sketch tiny stories in motion
          </h1>
          <p className="mt-3 text-base text-[#B0B0B0]">
            Describe a moment and our AI sprite artist will paint it as a looping 16×16 animation. Crisp blocks of color—no gradients, just character.
          </p>
        </div>

        {/* Input Section */}
        <div className="bg-[#1A1A1E] p-6 border border-[#606065] rounded-2xl">
          <label htmlFor="prompt" className="text-xs font-semibold uppercase tracking-wider text-[#8A8A8A]">
            Describe the loop
          </label>
          <div className="mt-2 flex flex-col md:flex-row items-start space-y-4 md:space-y-0 md:space-x-4">
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., a campfire crackling at night"
              className="w-full h-24 p-3 text-base bg-black/30 border border-[#606065] text-white rounded-lg focus:ring-2 focus:ring-[#00FFFF] focus:border-[#00FFFF] transition duration-200 resize-none"
            />
            <div className="flex flex-col items-start md:items-end w-full md:w-auto shrink-0">
                <button
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className="w-full md:w-auto px-6 py-3 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#1A1A1E] focus:ring-white transition-all duration-200 disabled:bg-gray-500 disabled:text-gray-300 disabled:cursor-not-allowed"
                >
                    {isLoading ? 'Generating...' : 'Generate'}
                </button>
                <div className="mt-2 text-right w-full text-xs text-[#8A8A8A]">
                    <label htmlFor="model-select" className="sr-only">Select Model</label>
                    <select 
                        id="model-select"
                        value={model} 
                        onChange={(e) => setModel(e.target.value)}
                        className="bg-transparent border-0 rounded-md focus:ring-0 focus:border-0 p-0 pr-5 appearance-none cursor-pointer text-[#B0B0B0]"
                        style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23B0B0B0' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.25em 1.25em' }}
                    >
                        <option value="gemini-2.5-flash" className="bg-[#1A1A1E]">GEMINI 2.5 FLASH</option>
                        <option value="gemini-2.5-pro" className="bg-[#1A1A1E]">GEMINI 2.5 PRO</option>
                    </select>
                    <p className="mt-1">
                        16×16 CANVAS · FLAT PALETTE
                    </p>
                </div>
            </div>
          </div>
           {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
        </div>

        {/* Display Section */}
        <div className="bg-[#1A1A1E] p-6 border border-[#606065] rounded-2xl min-h-[420px] flex flex-col items-center justify-center">
          {isLoading ? (
             <div className="text-center text-[#8A8A8A]">
                <p>Painting your story...</p>
             </div>
          ) : currentFrame && animationData ? (
            <div className="flex flex-col items-center space-y-6">
                <div className="p-4 bg-black/30 rounded-xl">
                    <PixelCanvas 
                      frameData={currentFrame} 
                      palette={animationData.palette} 
                      isDitheringEnabled={isDitheringEnabled}
                    />
                </div>
                <ColorPalette palette={animationData.palette} />
            </div>
          ) : (
            <div className="text-center text-[#8A8A8A]">
              <p>Your 16x16 animation will appear here.</p>
              {!error && <p className="text-sm mt-1">Click 'Generate' to begin.</p>}
            </div>
          )}
        </div>

        {/* Playback Section */}
        <div className="bg-[#1A1A1E] p-6 border border-[#606065] rounded-2xl">
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#8A8A8A]">
                    Playback
                </h3>
                {animationData && (
                    <button
                        onClick={handleDownload}
                        className="px-3 py-1 text-xs font-semibold text-[#B0B0B0] bg-[#0D0D10] border border-[#606065] rounded-md hover:bg-black/50 transition-colors"
                    >
                        Download Spritesheet
                    </button>
                )}
            </div>
            <div className="text-sm text-[#B0B0B0] font-mono">
                {animationData ? (
                    <>
                        <p>Frame {currentFrameIndex + 1} of {animationData.frames.length}</p>
                        <p>Frame cadence {animationData.cadenceMs} ms</p>
                    </>
                ) : (
                    <p>No animation loaded.</p>
                )}
            </div>
            {animationData && (
                <div className="mt-4 pt-4 border-t border-[#606065]">
                    <label className="flex items-center space-x-2 cursor-pointer text-sm text-[#B0B0B0]">
                        <input
                            type="checkbox"
                            checked={isDitheringEnabled}
                            onChange={() => setIsDitheringEnabled(!isDitheringEnabled)}
                            className="h-4 w-4 rounded bg-transparent border-[#606065] text-[#00FFFF] focus:ring-[#00FFFF]"
                        />
                        <span>Apply Dithering Effect</span>
                    </label>
                </div>
            )}
        </div>

      </main>
    </div>
  );
};

export default App;