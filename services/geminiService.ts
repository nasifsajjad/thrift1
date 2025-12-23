
import { GoogleGenAI, Type } from "@google/genai";
import { SearchParams, TripProposal, CitySuggestion } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getCitySuggestions = async (input: string): Promise<CitySuggestion[]> => {
  if (!input || input.length < 2) return [];

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Identify 5 major international cities that match or start with "${input}". Return as a JSON array of objects with keys "city" and "country".`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            city: { type: Type.STRING },
            country: { type: Type.STRING }
          },
          required: ["city", "country"]
        }
      }
    }
  });

  try {
    return JSON.parse(response.text);
  } catch (e) {
    return [];
  }
};

export const generateTrips = async (params: SearchParams): Promise<TripProposal[]> => {
  const prompt = `
    You are the high-precision "Thrift Trip" engine. Your task is to find the 3 absolute cheapest international vacation pairings.
    
    Parameters:
    - Origin: ${params.origin}
    - Availability Window: ${params.windowStart} to ${params.windowEnd}
    - Stay Duration: Exactly ${params.stayDuration} days
    - Travelers: ${params.passengers}
    
    STRICT DATA QUALITY RULES:
    1. Search Google Flights for the 3 lowest round-trip prices. The dates MUST be within the window.
    2. Search Google Hotels for the most affordable, well-rated stay for those exact flight dates.
    3. BOOKING LINKS: You MUST generate high-fidelity deep links.
       - For Flights: Use a Google Flights search URL that pre-fills the origin, destination, and dates. 
         Format: https://www.google.com/travel/flights?q=Flights%20to%20[DESTINATION]%20from%20[ORIGIN]%20on%20[DEPARTURE_DATE]%20returning%20[RETURN_DATE]
       - For Hotels: Use a Google Hotels search URL that pre-fills the hotel name, destination, and dates.
         Format: https://www.google.com/travel/hotels?q=[HOTEL_NAME]%20in%20[DESTINATION]%20checkin%20[DEPARTURE_DATE]%20checkout%20[RETURN_DATE]
    4. CURRENCY & MATH: 
       - Identify the local currency of ${params.origin}. 
       - Calculate: Total = (Flight Price) + (Hotel Total for ${params.stayDuration} days) + (Local Costs).
       - Ensure all components are in the local currency. Double-check your arithmetic.
    5. IMAGE: Use a high-quality Unsplash image URL related to the destination.
    
    Return the response as a valid JSON array of 3 TripProposal objects.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            destination: { type: Type.STRING },
            country: { type: Type.STRING },
            currency: { type: Type.STRING, description: "Currency symbol (e.g., $, ₹, £, €)" },
            summary: { type: Type.STRING },
            flight: {
              type: Type.OBJECT,
              properties: {
                airline: { type: Type.STRING },
                price: { type: Type.NUMBER },
                departureDate: { type: Type.STRING },
                returnDate: { type: Type.STRING },
                bookingUrl: { type: Type.STRING, description: "Deep link to Google Flights with parameters" }
              },
              required: ["airline", "price", "departureDate", "returnDate", "bookingUrl"]
            },
            hotel: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                rating: { type: Type.NUMBER },
                totalPrice: { type: Type.NUMBER },
                bookingUrl: { type: Type.STRING, description: "Deep link to Google Hotels with parameters" }
              },
              required: ["name", "totalPrice", "bookingUrl"]
            },
            localCosts: {
              type: Type.OBJECT,
              properties: {
                total: { type: Type.NUMBER }
              },
              required: ["total"]
            },
            itinerary: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  day: { type: Type.NUMBER },
                  activity: { type: Type.STRING },
                  description: { type: Type.STRING }
                }
              }
            }
          },
          required: ["destination", "country", "currency", "flight", "hotel", "localCosts"]
        }
      }
    }
  });

  try {
    const rawTrips = JSON.parse(response.text);
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = groundingChunks.map((chunk: any) => ({
      title: chunk.web?.title || "Deal Source",
      uri: chunk.web?.uri || "#"
    })).filter((s: any) => s.uri !== "#");
    
    return rawTrips.map((trip: any, index: number) => ({
      ...trip,
      id: `trip-${index}-${Date.now()}`,
      imageUrl: `https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80&sig=${encodeURIComponent(trip.destination)}`,
      totalCost: Math.round(trip.flight.price + trip.hotel.totalPrice + (trip.localCosts?.total || 0)),
      sources
    })).sort((a: any, b: any) => a.totalCost - b.totalCost);
  } catch (err) {
    console.error("Data verification error:", err);
    throw err;
  }
};
