
import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";

/**
 * Service to interact with Google Gemini API for image background replacement.
 * Uses gemini-3-pro-image-preview for high-quality image-to-image tasks.
 */
export const generateBackdrop = async (
  base64Image: string,
  mimeType: string,
  stylePrompt: string
): Promise<string> => {
  // Always create a new instance before call to ensure we use the latest injected key
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  
  // Upgrade to Gemini 3 Pro Image model
  const modelName = 'gemini-3-pro-image-preview';
  
  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image.split(',')[1],
              mimeType: mimeType,
            },
          },
          {
            text: `Replace the background of this product image with a high-end lifestyle setting. 
            Style: ${stylePrompt}. 
            
            Preserve the product exactly. Match lighting and shadows. Use shallow depth of field.
            Context: ${SYSTEM_INSTRUCTION}`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
          imageSize: "1K"
        },
        // Gemini 3 Pro supports Google Search for real-time visual context if needed
        tools: [{googleSearch: {}}],
      }
    });

    if (!response.candidates?.[0]?.content?.parts) {
      throw new Error("No response from Gemini 3.");
    }

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }

    throw new Error("No image was generated. Please try a more descriptive prompt.");
  } catch (error: any) {
    console.error("Gemini 3 API Error:", error);
    // Handle the specific "Requested entity was not found" error by indicating a key issue
    if (error.message?.includes("Requested entity was not found")) {
      throw new Error("API Key configuration issue. Please re-select your Gemini API key.");
    }
    throw new Error(error.message || "Failed to connect to Gemini 3 API.");
  }
};
