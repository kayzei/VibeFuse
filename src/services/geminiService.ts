import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function identifySong(audioData?: string) {
  // In a real app, we'd send audio bytes. 
  // Here we'll simulate the "listening" experience and return a mock identification or a fun response.
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: "The user is using a 'Shazam' feature in a music app called VibeFuse. They are in Lusaka, Zambia. Suggest a popular Zambian song that might be playing right now, and give a brief fun fact about the artist. Return as JSON with keys: title, artist, funFact.",
    config: {
      responseMimeType: "application/json"
    }
  });

  try {
    return JSON.parse(response.text);
  } catch (e) {
    return {
      title: "Unknown Vibes",
      artist: "Local Legend",
      funFact: "This track is so underground even the AI is still vibing to it."
    };
  }
}

export async function getRecommendations(history: string[]) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Based on these recently played tracks: ${history.join(', ')}. Suggest 3 more tracks (title and artist) that a Gen Z listener in Lusaka would love. Include at least one Zambian artist. Return as a JSON array of objects with keys: title, artist.`,
    config: {
      responseMimeType: "application/json"
    }
  });

  try {
    return JSON.parse(response.text);
  } catch (e) {
    return [];
  }
}

export async function getLyrics(title: string, artist: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate synchronized lyrics for the song "${title}" by "${artist}". The song is a popular Zambian hit. Format the output as a JSON array of objects with keys: time (in seconds) and text. Make it feel authentic to the Zambian music scene.`,
    config: {
      responseMimeType: "application/json"
    }
  });

  try {
    return JSON.parse(response.text);
  } catch (e) {
    return [
      { time: 0, text: "[Music playing]" },
      { time: 5, text: "Yeah, Z-Pulse vibes..." },
      { time: 10, text: "Lusaka to the world!" }
    ];
  }
}
