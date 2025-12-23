
export interface FlightInfo {
  airline: string;
  price: number;
  departureDate: string;
  returnDate: string;
  departureTime: string;
  arrivalTime: string;
  stops: number;
  bookingUrl: string;
}

export interface HotelInfo {
  name: string;
  rating: number;
  pricePerNight: number;
  totalPrice: number;
  location: string;
  bookingUrl: string;
}

export interface LocalCosts {
  food: number;
  sightseeing: number;
  transport: number;
  total: number;
}

export interface ItineraryDay {
  day: number;
  activity: string;
  description: string;
}

export interface TripProposal {
  id: string;
  destination: string;
  country: string;
  currency: string;
  imageUrl: string;
  flight: FlightInfo;
  hotel: HotelInfo;
  localCosts: LocalCosts;
  itinerary: ItineraryDay[];
  summary: string;
  totalCost: number;
  sources?: { title: string; uri: string }[];
}

export interface SearchParams {
  origin: string;
  windowStart: string;
  windowEnd: string;
  stayDuration: number;
  passengers: number;
}

export interface CitySuggestion {
  city: string;
  country: string;
}
