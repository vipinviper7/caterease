import { z } from 'zod';
import { addDays, isAfter } from 'date-fns';
import { MIN_BOOKING_DAYS_AHEAD } from './constants';

export const phoneSchema = z.string()
  .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit phone number');

export const otpSchema = z.string()
  .length(6, 'OTP must be 6 digits')
  .regex(/^\d+$/, 'OTP must contain only digits');

export const profileSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  default_city: z.string().optional(),
  dietary_preference: z.enum(['veg', 'non-veg', 'vegan', 'jain', 'gluten-free']).optional(),
});

export const addressSchema = z.object({
  label: z.string().min(1, 'Label is required'),
  full_address: z.string().min(5, 'Address is too short'),
  city: z.string().min(2, 'City is required'),
  pincode: z.string().regex(/^\d{6}$/, 'Enter a valid 6-digit pincode'),
});

export const bookingFormSchema = z.object({
  event_type: z.enum(['wedding', 'birthday', 'corporate', 'housewarming', 'engagement', 'other']),
  event_date: z.string().refine((date) => {
    const minDate = addDays(new Date(), MIN_BOOKING_DAYS_AHEAD);
    return isAfter(new Date(date), minDate);
  }, `Event must be at least ${MIN_BOOKING_DAYS_AHEAD} days from today`),
  event_time: z.string().min(1, 'Select a time'),
  guest_count: z.number().min(10, 'Minimum 10 guests'),
  venue_address: z.string().min(5, 'Enter the venue address'),
  special_requests: z.string().optional(),
});

export const reviewSchema = z.object({
  overall_rating: z.number().min(1).max(5),
  taste_rating: z.number().min(1).max(5),
  service_rating: z.number().min(1).max(5),
  value_rating: z.number().min(1).max(5),
  cleanliness_rating: z.number().min(1).max(5),
  text: z.string().optional(),
});
