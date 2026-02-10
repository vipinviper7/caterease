export type BookingStatus =
  | 'draft'
  | 'pending_confirmation'
  | 'confirmed'
  | 'menu_locked'
  | 'advance_paid'
  | 'in_preparation'
  | 'event_day'
  | 'completed'
  | 'cancelled';

export type EventType =
  | 'wedding'
  | 'birthday'
  | 'corporate'
  | 'housewarming'
  | 'engagement'
  | 'other';

export type DietaryTag = 'veg' | 'non-veg' | 'vegan' | 'jain' | 'gluten-free';

export interface Profile {
  id: string;
  phone: string;
  full_name: string | null;
  avatar_url: string | null;
  referral_code: string;
  default_city: string | null;
  dietary_preference: DietaryTag | null;
  notifications_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface Address {
  id: string;
  user_id: string;
  label: string;
  full_address: string;
  city: string;
  pincode: string;
  lat: number | null;
  lng: number | null;
  is_default: boolean;
  created_at: string;
}

export interface Caterer {
  id: string;
  name: string;
  description: string;
  cuisines: string[];
  event_types: EventType[];
  is_pure_veg: boolean;
  is_verified: boolean;
  min_price_per_plate: number;
  max_price_per_plate: number;
  min_guests: number;
  max_guests: number;
  city: string;
  rating_avg: number;
  rating_count: number;
  cover_image_url: string;
  logo_url: string;
  response_time_hours: number;
  staff_charge_per_plate: number;
  setup_charge: number;
  delivery_charge: number;
  specialties: string[];
  created_at: string;
}

export interface MenuCategory {
  id: string;
  caterer_id: string;
  name: string;
  sort_order: number;
}

export interface MenuItem {
  id: string;
  category_id: string;
  caterer_id: string;
  name: string;
  price: number;
  is_veg: boolean;
  dietary_tags: DietaryTag[];
  is_popular: boolean;
  image_url: string | null;
  description: string | null;
}

export interface Booking {
  id: string;
  user_id: string;
  caterer_id: string;
  event_type: EventType;
  event_date: string;
  event_time: string;
  guest_count: number;
  venue_address: string;
  special_requests: string | null;
  status: BookingStatus;
  food_total: number;
  staff_charge: number;
  setup_charge: number;
  delivery_charge: number;
  subtotal: number;
  gst_amount: number;
  grand_total: number;
  advance_amount: number;
  balance_amount: number;
  advance_paid: boolean;
  balance_paid: boolean;
  agreement_accepted: boolean;
  timeline: BookingTimelineEntry[];
  created_at: string;
  updated_at: string;
  // Joined
  caterer?: Caterer;
}

export interface BookingTimelineEntry {
  stage: BookingStatus;
  label: string;
  timestamp: string | null;
  note: string | null;
}

export interface BookingItem {
  id: string;
  booking_id: string;
  menu_item_id: string;
  name: string;
  price: number;
  is_veg: boolean;
  quantity: number;
}

export interface Review {
  id: string;
  booking_id: string;
  caterer_id: string;
  user_id: string;
  overall_rating: number;
  taste_rating: number;
  service_rating: number;
  value_rating: number;
  cleanliness_rating: number;
  text: string | null;
  images: string[];
  created_at: string;
  // Joined
  profile?: Profile;
}

export interface Conversation {
  id: string;
  booking_id: string;
  user_id: string;
  caterer_id: string;
  last_message: string | null;
  last_message_at: string | null;
  user_unread_count: number;
  caterer_unread_count: number;
  created_at: string;
  // Joined
  caterer?: Caterer;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_type: 'user' | 'caterer' | 'system';
  content: string;
  created_at: string;
}

export interface Referral {
  id: string;
  referrer_id: string;
  referee_id: string | null;
  referral_code: string;
  status: 'pending' | 'completed' | 'expired';
  created_at: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  caterer_id: string;
  created_at: string;
}
