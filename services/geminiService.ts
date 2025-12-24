import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { SearchParams, TripProposal, CitySuggestion } from "../types";

// Vite uses import.meta.env instead of process.env
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export const getCitySuggestions = async (input: string): Promise<CitySuggestion[]> => {
  if (!input || input.length < 2) return [];

  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
  });

  const prompt = `Identify 5 major international cities that match or start with "${input}". Return as a JSON array of objects with keys "city" and "country".`;

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: SchemaType.ARRAY,
        items: {
          type: SchemaType.OBJECT,
          properties: {
            city: { type: SchemaType.STRING },
            country: { type: SchemaType.STRING }
          },
          required: ["city", "country"]
        }
      }
    }
  });

  try {
    const responseText = result.response.text();
    return JSON.parse(responseText || '[]');
  } catch (e) {
    console.error("City Suggestion Error:", e);
    return [];
  }
};

export const generateTrips = async (params: SearchParams): Promise<TripProposal[]> => {
  const genAI = new GoogleGenerativeAI(API_KEY);
  // Using gemini-1.5-flash for speed and reliability in search tasks
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    tools: [{ googleSearchRetrieval: {} }] as any,
  });

  const prompt = `
    You are the high-precision "Thrift Trip" engine. Find the 3 absolute cheapest international vacation pairings.
    User Parameters:
    - Origin: ${params.origin}
    - Availability Window: ${params.windowStart} to ${params.windowEnd}
    - Stay Duration: Exactly ${params.stayDuration} days
    - Travelers: ${params.passengers}
    
    STRICT REQUIREMENTS:
    1. DEEP LINKS: You MUST generate high-fidelity direct search URLs for Google Flights and Google Hotels.
    2. ACCURACY: Prices must be real-time estimates found via search.
    3. MATH: Total cost must be the exact sum of Flight + Hotel + Local costs.
    4. CURRENCY: All amounts must be in the local currency of ${params.origin}.
    5. JSON: Output ONLY a JSON array.
  `;

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: SchemaType.ARRAY,
        items: {
          type: SchemaType.OBJECT,
          properties: {
            destination: { type: SchemaType.STRING },
            country: { type: SchemaType.STRING },
            currency: { type: SchemaType.STRING },
            summary: { type: SchemaType.STRING },
            flight: {
              type: SchemaType.OBJECT,
              properties: {
                airline: { type: SchemaType.STRING },
                price: { type: SchemaType.NUMBER },
                departureDate: { type: SchemaType.STRING },
                returnDate: { type: SchemaType.STRING },
                bookingUrl: { type: SchemaType.STRING }
              },
              required: ["airline", "price", "departureDate", "returnDate", "bookingUrl"]
            },
            hotel: {
              type: SchemaType.OBJECT,
              properties: {
                name: { type: SchemaType.STRING },
                rating: { type: SchemaType.NUMBER },
                totalPrice: { type: SchemaType.NUMBER },
                bookingUrl: { type: SchemaType.STRING }
              },
              required: ["name", "totalPrice", "bookingUrl"]
            },
            localCosts: {
              type: SchemaType.OBJECT,
              properties: {
                total: { type: SchemaType.NUMBER }
              },
              required: ["total"]
            },
            itinerary: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  day: { type: SchemaType.NUMBER },
                  activity: { type: SchemaType.STRING },
                  description: { type: SchemaType.STRING }
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
    const responseText = result.response.text();
    const rawTrips = JSON.parse(responseText || '[]');
    
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
