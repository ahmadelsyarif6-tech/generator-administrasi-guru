
import { GoogleGenAI, Modality, GenerateContentResponse } from "@google/genai";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateTextContent = async (prompt: string, systemInstruction?: string) => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Text Error:", error);
    throw error;
  }
};

// New function for Streaming response
export const generateTextContentStream = async (
    prompt: string, 
    onChunk: (text: string) => void,
    systemInstruction?: string
): Promise<string> => {
    try {
        const ai = getAI();
        const responseStream = await ai.models.generateContentStream({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.7,
            }
        });

        let fullText = '';
        for await (const chunk of responseStream) {
            const chunkText = (chunk as GenerateContentResponse).text || '';
            fullText += chunkText;
            onChunk(chunkText);
        }
        return fullText;
    } catch (error) {
        console.error("Gemini Stream Error:", error);
        throw error;
    }
};

export const generateImage = async (prompt: string): Promise<string | null> => {
  try {
    const ai = getAI();
    // Using imagen-4.0-generate-001 for high quality images as per guidance
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: '1:1',
      },
    });
    const base64ImageBytes = response.generatedImages?.[0]?.image?.imageBytes;
    if (base64ImageBytes) {
      return `data:image/jpeg;base64,${base64ImageBytes}`;
    }
    return null;
  } catch (error) {
    console.error("Gemini Image Error:", error);
    throw error;
  }
};

export const generateVideo = async (prompt: string): Promise<string | undefined> => {
  try {
    // Check API key selection for Veo
    if (window.aistudio && !await window.aistudio.hasSelectedApiKey()) {
        await window.aistudio.openSelectKey();
    }
    
    // Create new instance after potential key selection
    const ai = getAI();
    
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      config: {
        numberOfVideos: 1,
        resolution: '720p', // 720p is safer for preview
        aspectRatio: '16:9'
      }
    });

    // Polling
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    // Append key for fetching
    if (downloadLink) {
        return `${downloadLink}&key=${process.env.API_KEY}`;
    }
    return undefined;
  } catch (error) {
    console.error("Gemini Video Error:", error);
    throw error;
  }
};

export const textToSpeech = async (text: string, voiceName: string = 'Kore'): Promise<ArrayBuffer | null> => {
    try {
        const ai = getAI();
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: text }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: voiceName },
                    },
                },
            },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (base64Audio) {
             const binaryString = atob(base64Audio);
             const len = binaryString.length;
             const bytes = new Uint8Array(len);
             for (let i = 0; i < len; i++) {
                bytes[i] = binaryString.charCodeAt(i);
             }
             return bytes.buffer;
        }
        return null;

    } catch (e) {
        console.error("TTS Error", e);
        throw e;
    }
}

export const editImage = async (base64Image: string, prompt: string): Promise<string | null> => {
    try {
        const ai = getAI();
        // Strip prefix if present
        const data = base64Image.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: data,
                            mimeType: 'image/png',
                        },
                    },
                    { text: prompt },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });
        
        const part = response.candidates?.[0]?.content?.parts?.[0];
        if (part && part.inlineData) {
             return `data:image/png;base64,${part.inlineData.data}`;
        }
        return null;
    } catch(e) {
        console.error("Edit Image Error", e);
        throw e;
    }
}
