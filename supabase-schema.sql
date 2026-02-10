-- CaterEase Database Schema
-- Run this in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Booking status enum
CREATE TYPE booking_status AS ENUM (
  'draft', 'pending_confirmation', 'confirmed', 'menu_locked',
  'advance_paid', 'in_preparation', 'event_day', 'completed', 'cancelled'
);

CREATE TYPE event_type AS ENUM (
  'wedding', 'birthday', 'corporate', 'housewarming', 'engagement', 'other'
);

-- 1. Profiles (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone TEXT,
  full_name TEXT,
  avatar_url TEXT,
  referral_code TEXT UNIQUE DEFAULT 'CE' || UPPER(SUBSTR(MD5(RANDOM()::TEXT), 1, 6)),
  default_city TEXT DEFAULT 'Bangalore',
  dietary_preference TEXT,
  notifications_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Addresses
CREATE TABLE addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  label TEXT NOT NULL,
  full_address TEXT NOT NULL,
  city TEXT NOT NULL,
  pincode TEXT NOT NULL,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Caterers
CREATE TABLE caterers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  cuisines TEXT[] DEFAULT '{}',
  event_types event_type[] DEFAULT '{}',
  is_pure_veg BOOLEAN DEFAULT FALSE,
  is_verified BOOLEAN DEFAULT FALSE,
  min_price_per_plate INTEGER NOT NULL,
  max_price_per_plate INTEGER NOT NULL,
  min_guests INTEGER DEFAULT 10,
  max_guests INTEGER DEFAULT 1000,
  city TEXT NOT NULL,
  rating_avg DECIMAL(2,1) DEFAULT 0.0,
  rating_count INTEGER DEFAULT 0,
  cover_image_url TEXT,
  logo_url TEXT,
  response_time_hours INTEGER DEFAULT 24,
  staff_charge_per_plate INTEGER DEFAULT 0,
  setup_charge INTEGER DEFAULT 0,
  delivery_charge INTEGER DEFAULT 0,
  specialties TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Menu Categories
CREATE TABLE menu_categories (
  id TEXT PRIMARY KEY,
  caterer_id TEXT REFERENCES caterers(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0
);

-- 5. Menu Items
CREATE TABLE menu_items (
  id TEXT PRIMARY KEY,
  category_id TEXT REFERENCES menu_categories(id) ON DELETE CASCADE NOT NULL,
  caterer_id TEXT REFERENCES caterers(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  price INTEGER NOT NULL,
  is_veg BOOLEAN DEFAULT TRUE,
  dietary_tags TEXT[] DEFAULT '{}',
  is_popular BOOLEAN DEFAULT FALSE,
  image_url TEXT,
  description TEXT
);

-- 6. Bookings
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  caterer_id TEXT REFERENCES caterers(id) NOT NULL,
  event_type event_type NOT NULL,
  event_date DATE NOT NULL,
  event_time TEXT NOT NULL,
  guest_count INTEGER NOT NULL,
  venue_address TEXT NOT NULL,
  special_requests TEXT,
  status booking_status DEFAULT 'draft',
  food_total INTEGER DEFAULT 0,
  staff_charge INTEGER DEFAULT 0,
  setup_charge INTEGER DEFAULT 0,
  delivery_charge INTEGER DEFAULT 0,
  subtotal INTEGER DEFAULT 0,
  gst_amount INTEGER DEFAULT 0,
  grand_total INTEGER DEFAULT 0,
  advance_amount INTEGER DEFAULT 0,
  balance_amount INTEGER DEFAULT 0,
  advance_paid BOOLEAN DEFAULT FALSE,
  balance_paid BOOLEAN DEFAULT FALSE,
  agreement_accepted BOOLEAN DEFAULT FALSE,
  timeline JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Booking Items
CREATE TABLE booking_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE NOT NULL,
  menu_item_id TEXT NOT NULL,
  name TEXT NOT NULL,
  price INTEGER NOT NULL,
  is_veg BOOLEAN DEFAULT TRUE,
  quantity INTEGER DEFAULT 1
);

-- 8. Reviews
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL,
  caterer_id TEXT REFERENCES caterers(id) NOT NULL,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  overall_rating INTEGER NOT NULL CHECK (overall_rating BETWEEN 1 AND 5),
  taste_rating INTEGER NOT NULL CHECK (taste_rating BETWEEN 1 AND 5),
  service_rating INTEGER NOT NULL CHECK (service_rating BETWEEN 1 AND 5),
  value_rating INTEGER NOT NULL CHECK (value_rating BETWEEN 1 AND 5),
  cleanliness_rating INTEGER NOT NULL CHECK (cleanliness_rating BETWEEN 1 AND 5),
  text TEXT,
  images TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Conversations
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id) NOT NULL,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  caterer_id TEXT REFERENCES caterers(id) NOT NULL,
  last_message TEXT,
  last_message_at TIMESTAMPTZ,
  user_unread_count INTEGER DEFAULT 0,
  caterer_unread_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Messages
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'caterer', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Favorites
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  caterer_id TEXT REFERENCES caterers(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, caterer_id)
);

-- 12. Referrals
CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID REFERENCES profiles(id) NOT NULL,
  referee_id UUID REFERENCES profiles(id),
  referral_code TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== TRIGGERS =====

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, phone)
  VALUES (NEW.id, NEW.phone);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Auto-update caterer rating on new review
CREATE OR REPLACE FUNCTION update_caterer_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE caterers
  SET rating_avg = (
    SELECT ROUND(AVG(overall_rating)::numeric, 1)
    FROM reviews WHERE caterer_id = NEW.caterer_id
  ),
  rating_count = (
    SELECT COUNT(*) FROM reviews WHERE caterer_id = NEW.caterer_id
  )
  WHERE id = NEW.caterer_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_review_created
  AFTER INSERT ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_caterer_rating();

-- ===== ROW LEVEL SECURITY =====

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE caterers ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read/update their own profile
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Addresses: users manage their own
CREATE POLICY "Users manage own addresses" ON addresses FOR ALL USING (auth.uid() = user_id);

-- Caterers & menus: public read
CREATE POLICY "Public read caterers" ON caterers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Public read menu categories" ON menu_categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Public read menu items" ON menu_items FOR SELECT TO authenticated USING (true);

-- Bookings: users see their own
CREATE POLICY "Users manage own bookings" ON bookings FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users view own booking items" ON booking_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM bookings WHERE bookings.id = booking_items.booking_id AND bookings.user_id = auth.uid())
);
CREATE POLICY "Users insert booking items" ON booking_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM bookings WHERE bookings.id = booking_items.booking_id AND bookings.user_id = auth.uid())
);

-- Reviews: public read, users create their own
CREATE POLICY "Public read reviews" ON reviews FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users create own reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Conversations & messages: users see their own
CREATE POLICY "Users manage own conversations" ON conversations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users view own messages" ON messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM conversations WHERE conversations.id = messages.conversation_id AND conversations.user_id = auth.uid())
);
CREATE POLICY "Users send messages" ON messages FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM conversations WHERE conversations.id = messages.conversation_id AND conversations.user_id = auth.uid())
);

-- Favorites: users manage their own
CREATE POLICY "Users manage own favorites" ON favorites FOR ALL USING (auth.uid() = user_id);

-- Referrals: users see their own
CREATE POLICY "Users view own referrals" ON referrals FOR SELECT USING (auth.uid() = referrer_id);

-- ===== REALTIME =====
-- Enable realtime on messages, conversations, bookings
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE bookings;
