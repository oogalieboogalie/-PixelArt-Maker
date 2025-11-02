import { GoogleGenAI, Type } from "@google/genai";
import { AnimationData } from '../types';

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const animationSchema = {
  type: Type.OBJECT,
  properties: {
    palette: {
      type: Type.ARRAY,
      description: "An array of 5 to 7 hex color strings used in the animation. The first color is usually the background.",
      items: { type: Type.STRING },
    },
    frames: {
      type: Type.ARRAY,
      description: "An array of 10 to 20 frames for a looping 16x16 pixel animation. Each frame is a 16x16 2D array of palette indices.",
      items: {
        type: Type.ARRAY,
        items: {
          type: Type.ARRAY,
          items: {
            type: Type.INTEGER,
            description: "Index corresponding to the 'palette' array.",
          },
        },
      },
    },
    cadenceMs: {
      type: Type.INTEGER,
      description: "The recommended time in milliseconds between each frame, between 100 and 500.",
    },
  },
  required: ["palette", "frames", "cadenceMs"],
};


export const generateAnimation = async (userPrompt: string, model: string): Promise<AnimationData> => {
  try {
    const result = await ai.models.generateContent({
        model: model,
        contents: `Generate a looping 16x16 pixel art animation based on this description: "${userPrompt}". The animation should be simple, with flat colors and clear character or object motion.`,
        config: {
            systemInstruction: "You are a creative sprite artist specializing in 16x16 pixel art animations. You only use flat colors and no gradients. Your output must be a valid JSON object matching the provided schema.",
            responseMimeType: "application/json",
            responseSchema: animationSchema,
            temperature: 0.8,
        }
    });

    const jsonString = result.text;
    const parsedData = JSON.parse(jsonString);

    // Basic validation
    if (!parsedData.palette || !parsedData.frames || !parsedData.cadenceMs) {
      throw new Error("Invalid animation data structure received from API.");
    }
    
    return parsedData as AnimationData;
  } catch (error) {
    console.error("Error generating animation:", error);
    throw new Error("Failed to generate animation. Please try a different prompt.");
  }
};