// types/index.ts — Single source of truth for all TypeScript interfaces

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  preferences: TravelPreferences;
  createdAt: Date;
}

export interface TravelPreferences {
  budget: 'budget' | 'moderate' | 'luxury';
  travelStyle: ('adventure' | 'cultural' | 'relaxation' | 'foodie' | 'family')[];
  dietaryRestrictions: string[];
  mobility: 'full' | 'limited' | 'wheelchair';
  preferredTransport: ('walking' | 'transit' | 'car' | 'taxi')[];
}

export interface Trip {
  id: string;
  userId: string;
  title: string;
  destination: Destination;
  startDate: string;   // ISO 8601
  endDate: string;     // ISO 8601
  days: Day[];
  status: 'draft' | 'confirmed' | 'active' | 'completed' | 'cancelled';
  totalBudgetEstimate: number;
  currency: string;
  travelTips?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Destination {
  name: string;
  country: string;
  coordinates: LatLng;
  placeId: string;  // Google Place ID
  timezone: string;
}

export interface Day {
  id: string;
  date: string;         // ISO 8601
  activities: Activity[];
  weather?: WeatherData;
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  category: 'attraction' | 'restaurant' | 'transport' | 'accommodation' | 'experience';
  location: {
    name: string;
    address: string;
    coordinates: LatLng;
    placeId?: string;   // Google Place ID
  };
  timeWindow: {
    start: string;      // "HH:mm"
    end: string;        // "HH:mm"
    duration: number;   // minutes
  };
  estimatedCost: number;
  currency: string;
  bookingUrl?: string;
  imageUrl?: string;
  rating?: number;
  tags: string[];
  notes?: string;
}

export interface LatLng {
  lat: number;
  lng: number;
}

export interface WeatherData {
  date: string;
  temperatureMax: number;
  temperatureMin: number;
  weatherCode: number;
  precipitation: number;
  windSpeed: number;
}

export interface FlightOption {
  id: string;
  origin: string;
  destination: string;
  departure: string;    // ISO 8601
  arrival: string;      // ISO 8601
  airline: string;
  price: number;
  currency: string;
  duration: number;     // minutes
  stops: number;
}

export interface GenerateItineraryInput {
  destination: string;
  startDate: string;
  endDate: string;
  preferences: TravelPreferences;
  mustSee?: string[];
  budget: number;
  numberOfTravelers: number;
}

export interface PlaceDetails {
  placeId: string;
  name: string;
  address: string;
  rating?: number;
  openingHours?: string[];
  photoUrls?: string[];
  coordinates: LatLng;
}

export interface RouteResult {
  durationSeconds: number;
  distanceMeters: number;
  polyline?: string;
}

export type ActivityCategory = Activity['category'];

export const ACTIVITY_CATEGORY_META: Record<
  ActivityCategory,
  { bg: string; color: string; label: string }
> = {
  attraction:    { bg: '#EBF4FF', color: '#007AFF', label: 'Attraction' },
  restaurant:    { bg: '#FFF3E0', color: '#FF9500', label: 'Restaurant' },
  transport:     { bg: '#E8F5E9', color: '#34C759', label: 'Transport' },
  accommodation: { bg: '#F3E5F5', color: '#AF52DE', label: 'Stay' },
  experience:    { bg: '#FCE4EC', color: '#FF2D55', label: 'Experience' },
};
