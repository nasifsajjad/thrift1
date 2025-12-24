
import { GoogleGenAI, Type } from "@google/genai";
import { SearchParams, TripProposal, CitySuggestion } from "../types";
export const getCitySuggestions = async (input: string): Promise<CitySuggestion[]> => {
  if (!input || input.length < 2) return [];

  // Initialize right before call to ensure latest API key
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
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
     return JSON.parse(response.text || '[]');
  } catch (e) {
    return [];
  }
};

export const generateTrips = async (params: SearchParams): Promise<TripProposal[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const prompt = `
  You are the high-precision "Thrift Trip" engine. Find the 3 absolute cheapest international vacation pairings.
     User Parameters:
    - Origin: ${params.origin}
    - Availability Window: ${params.windowStart} to ${params.windowEnd}
    - Stay Duration: Exactly ${params.stayDuration} days
    - Travelers: ${params.passengers}
     STRICT REQUIREMENTS:
      1. DEEP LINKS: You MUST generate high-fidelity direct search URLs. 
         - Flights: https://www.google.com/travel/flights?q=Flights%20to%20[DEST_CITY]%20from%20[ORIGIN_CITY]%20on%20[DEPARTURE_DATE]%20returning%20[RETURN_DATE]
         - Hotels: https://www.google.com/travel/hotels?q=[HOTEL_NAME]%20in%20[DEST_CITY]%20checkin%20[DEPARTURE_DATE]%20checkout%20[RETURN_DATE]
      2. ACCURACY: The flight and hotel prices must be real-time estimates found via search. 
      3. MATH: The "totalCost" must be the exact sum of Flight Price + Hotel Total + Local Costs. 
      4. CURRENCY: All amounts must be in the local currency of ${params.origin}. Include the currency symbol.
      5. IMAGE: High-quality Unsplash image for the destination.
       Output JSON only.
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
            currency: { type: Type.STRING },
            summary: { type: Type.STRING },
            flight: {
              type: Type.OBJECT,
              properties: {
                airline: { type: Type.STRING },
                price: { type: Type.NUMBER },
                departureDate: { type: Type.STRING },
                returnDate: { type: Type.STRING },
                 bookingUrl: { type: Type.STRING }
              },
              required: ["airline", "price", "departureDate", "returnDate", "bookingUrl"]
            },
            hotel: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                rating: { type: Type.NUMBER },
                totalPrice: { type: Type.NUMBER },
                      bookingUrl: { type: Type.STRING }
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
      const rawTrips = JSON.parse(response.text || '[]');
    return rawTrips.map((trip: any, index: number) => ({
      ...trip,
      id: `trip-${index}-${Date.now()}`,
      imageUrl: `https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80&sig=${encodeURIComponent(trip.destination)}`,
         totalCost: Math.round(trip.flight.price + trip.hotel.totalPrice + (trip.localCosts?.total || 0))
    })).sort((a: any, b: any) => a.totalCost - b.totalCost);
  } catch (err) {
     console.error("Gemini Data Parsing Error:", err);
    throw err;
  }
};
