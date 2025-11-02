import React, { useRef, useEffect } from 'react';

interface PixelCanvasProps {
  frameData: number[][];
  palette: string[];
  pixelSize?: number;
  isDitheringEnabled?: boolean;
}

const PixelCanvas: React.FC<PixelCanvasProps> = ({ frameData, palette, pixelSize = 20, isDitheringEnabled = false }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasSize = 16 * pixelSize;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !frameData || !palette.length) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set the background color from the palette, or clear if palette is empty
    if (palette[0]) {
      ctx.fillStyle = palette[0];
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const colorIndex = frameData[y]?.[x];

        // The background (index 0) is already drawn, so skip it.
        if (colorIndex === 0) continue;

        // Apply dithering: for non-background colors, only draw on a checkerboard pattern
        if (isDitheringEnabled && (x + y) % 2 !== 0) {
          continue;
        }
        
        if (colorIndex !== undefined && palette[colorIndex]) {
          ctx.fillStyle = palette[colorIndex];
          ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
        }
      }
    }
  }, [frameData, palette, pixelSize, isDitheringEnabled, canvasSize]);

  return (
    <canvas
      ref={canvasRef}
      width={canvasSize}
      height={canvasSize}
      className="bg-black/20"
    />
  );
};

export default PixelCanvas;