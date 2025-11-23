import { GoogleGenAI, Type } from "@google/genai";
import { LegalResponse, GroundingSource, MakeupRecommendation } from "../types";

// Declare the global variable injected by Vite
declare const __GEMINI_KEY__: string | undefined;

// --- LAZY INITIALIZATION ---
let aiInstance: GoogleGenAI | null = null;

const getAI = () => {
  if (!aiInstance) {
    const apiKey = typeof __GEMINI_KEY__ !== 'undefined' ? __GEMINI_KEY__ : '';
    if (!apiKey) {
      console.warn("API Key is missing! AI features will fail.");
    }
    aiInstance = new GoogleGenAI({ apiKey: apiKey || '' });
  }
  return aiInstance;
};

// --- ERROR HELPER ---
const handleGeminiError = (error: any): string => {
  const msg = error?.message || error?.toString() || '';
  console.error("Gemini API Error:", msg);
  
  if (msg.includes('403') || msg.includes('leaked') || msg.includes('PERMISSION_DENIED')) {
    return "⛔ ALERTA DE SEGURIDAD: La API Key ha sido revocada por Google porque fue detectada como pública. Por favor, genera una nueva clave en Google AI Studio y actualiza los Secretos de GitHub.";
  }
  if (msg.includes('429') || msg.includes('quota')) {
    return "⏳ Cuota excedida. Por favor espera un momento antes de intentarlo de nuevo.";
  }
  return "⚠️ Hubo un problema conectando con la inteligencia artificial. Inténtalo de nuevo.";
};

// --- WISHLIST SERVICE ---
export const getWishlistSuggestions = async (categoryLabel: string): Promise<string[]> => {
  try {
    const ai = getAI();
    const model = 'gemini-2.5-flash';
    
    const response = await ai.models.generateContent({
      model,
      contents: `Give me 5 unique, romantic, or thoughtful ideas for a wishlist specifically for my girlfriend named Libertad.
      The category is: "${categoryLabel}".
      Examples:
      - If category is flowers: "Peonies with Eucalyptus", "A single preserved rose".
      - If category is plans: "Picnic at sunset", "Pottery class date".
      - If category is restaurants: "That new Italian place with the garden", "Rooftop sushi".
      
      Keep them short and concise (under 10 words). Language: Spanish.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING
          }
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) return [];
    
    const suggestions = JSON.parse(jsonText) as string[];
    return suggestions;

  } catch (error) {
    console.error("Error generating suggestions:", error);
    // Return a single item array with the error message so it appears in the UI suggestions list
    return [handleGeminiError(error)];
  }
};

// --- LEGAL CONSULTING SERVICE (HIGH RIGOR) ---
export const getLegalConsultation = async (query: string): Promise<LegalResponse> => {
  try {
    const ai = getAI();
    // Use gemini-2.5-flash instead of 3-pro-preview for stability on free keys if pro fails
    const model = 'gemini-2.5-flash'; 

    const response = await ai.models.generateContent({
      model,
      contents: query,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: `You are a Senior Spanish Law Tutor and Legal Expert assisting a law student. 
        Your goal is to explain concepts from the Spanish Civil Code, Penal Code, and Constitution with EXTREME rigor.
        
        Rules:
        1. ALWAYS cite the specific Article number (e.g., "Artículo 1902 del Código Civil").
        2. Differentiate between 'Opinion' and 'Law'. Only state facts supported by legislation.
        3. Use professional, academic Spanish, but clear enough for a student to revise.
        4. If a law has been recently modified (e.g., 'Solo sí es sí'), mention the update.
        5. If you are unsure or the law is ambiguous, explicitly state: "Existe debate doctrinal sobre esto..." or "Necesito verificar más fuentes".
        6. Structure your answer with Markdown: Use **Bold** for key terms and > Blockquotes for article text.
        `,
        temperature: 0.3, 
      }
    });

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources: GroundingSource[] = groundingChunks
      .map((chunk: any) => {
        if (chunk.web?.uri && chunk.web?.title) {
          return { uri: chunk.web.uri, title: chunk.web.title };
        }
        return null;
      })
      .filter((s: any) => s !== null) as GroundingSource[];

    const uniqueSources = Array.from(new Set(sources.map(s => s.uri)))
      .map(uri => sources.find(s => s.uri === uri)!);

    return {
      text: response.text || "Lo siento, no pude procesar la consulta legal en este momento.",
      sources: uniqueSources
    };

  } catch (error) {
    return {
      text: handleGeminiError(error),
      sources: []
    };
  }
};

// --- MAKEUP COLOR MATCH SERVICE ---
export const getMakeupRecommendations = async (hexColor: string): Promise<MakeupRecommendation[]> => {
  try {
    const ai = getAI();
    const model = 'gemini-2.5-flash';
    
    const response = await ai.models.generateContent({
      model,
      contents: `I have detected a skin tone with HEX code: ${hexColor}.
      Act as a professional Makeup Artist in Spain. 
      Recommend 4 distinct products available in Spanish stores (Sephora Spain, Primor, Druni) that would best match or flatter this specific skin tone.
      
      Do NOT restrict yourself to specific categories like foundation or blush. 
      Select the absolute best 4 products (e.g., Lipsticks, Eye Shadows, Blushes, Highlighters, etc.) that create a beautiful, harmonious look for this skin tone based on color theory.
      Focus on trending items and high-quality matches.
      
      Return strictly JSON. Language: Spanish.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              category: { type: Type.STRING },
              productName: { type: Type.STRING },
              reason: { type: Type.STRING },
              hexColorEstimate: { type: Type.STRING, description: "Estimated hex color of the product itself" }
            }
          }
        }
      }
    });

    return JSON.parse(response.text || "[]") as MakeupRecommendation[];

  } catch (error) {
    const errorMsg = handleGeminiError(error);
    // Return a dummy error recommendation to display the message
    return [{
      category: "Error",
      productName: "Error de Conexión",
      reason: errorMsg,
      hexColorEstimate: "#ff0000"
    }];
  }
};

// --- MAKEUP IMAGE ANALYSIS SERVICE ---
export const analyzeMakeupImage = async (base64Image: string): Promise<{
  brand: string;
  name: string;
  category: 'face' | 'eyes' | 'lips' | 'skincare';
  paoMonths: number;
}> => {
  try {
    const ai = getAI();
    const model = 'gemini-2.5-flash';
    
    const cleanBase64 = base64Image.split(',')[1] || base64Image;

    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: cleanBase64
            }
          },
          {
            text: `Analyze this image of a makeup product. Identify the Brand, Product Name, Category (face, eyes, lips, or skincare), and standard PAO (Period After Opening in months, look for the open jar symbol like "12M", "6M").
            
            If you cannot find the PAO symbol, estimate it based on the product type:
            - Mascara/Eyeliner: 6
            - Foundation/Skincare: 12
            - Powders/Lipsticks: 24
            
            Return strictly JSON.`
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            brand: { type: Type.STRING },
            name: { type: Type.STRING },
            category: { type: Type.STRING, enum: ['face', 'eyes', 'lips', 'skincare'] },
            paoMonths: { type: Type.NUMBER }
          }
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    return {
      brand: result.brand || "Marca Desconocida",
      name: result.name || "Producto Nuevo",
      category: result.category || "face",
      paoMonths: result.paoMonths || 12
    };

  } catch (error) {
    console.error("Error analyzing makeup image:", error);
    return {
      brand: "Error API",
      name: handleGeminiError(error).slice(0, 30) + "...", // Truncate for UI
      category: "face",
      paoMonths: 12
    };
  }
};
