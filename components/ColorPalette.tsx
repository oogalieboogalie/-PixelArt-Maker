
import React from 'react';

interface ColorPaletteProps {
  palette: string[];
}

const ColorPalette: React.FC<ColorPaletteProps> = ({ palette }) => {
  const handleCopy = (color: string) => {
    navigator.clipboard.writeText(color);
  };

  return (
    <div className="flex items-center space-x-3">
      {palette.map((color, index) => (
        <div key={index} className="flex flex-col items-center group">
          <button
            onClick={() => handleCopy(color)}
            className="w-8 h-8 md:w-10 md:h-10 rounded-md border border-[#606065] transition-transform duration-200 group-hover:scale-110"
            style={{ backgroundColor: color }}
            aria-label={`Copy color ${color}`}
          />
          <span className="mt-2 text-xs text-[#8A8A8A] uppercase font-mono transition-opacity duration-200 opacity-0 group-hover:opacity-100">
            {color.substring(1)}
          </span>
        </div>
      ))}
    </div>
  );
};

export default ColorPalette;