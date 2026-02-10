export const COLORS = {
  primary: '#E86A50',
  primaryLight: '#FFF3F0',
  primaryDark: '#C85540',
  success: '#008A05',
  veg: '#008A05',
  nonveg: '#C62828',
  white: '#FFFFFF',
  black: '#000000',
  neutral50: '#FAFAFA',
  neutral100: '#F5F5F5',
  neutral200: '#EEEEEE',
  neutral300: '#E0E0E0',
  neutral400: '#BDBDBD',
  neutral500: '#9E9E9E',
  neutral600: '#757575',
  neutral700: '#616161',
  neutral800: '#424242',
  neutral900: '#212121',
} as const;

export const EVENT_TYPES = [
  { key: 'wedding', label: 'Wedding', icon: 'heart' },
  { key: 'birthday', label: 'Birthday', icon: 'cake' },
  { key: 'corporate', label: 'Corporate', icon: 'briefcase' },
  { key: 'housewarming', label: 'Housewarming', icon: 'home' },
  { key: 'engagement', label: 'Engagement', icon: 'gem' },
  { key: 'other', label: 'Other', icon: 'calendar' },
] as const;

export const CUISINE_TYPES = [
  'North Indian',
  'South Indian',
  'Chinese',
  'Continental',
  'Mughlai',
  'Street Food',
  'Italian',
  'Multi-Cuisine',
] as const;

export const GST_RATE = 0.05;
export const ADVANCE_PERCENTAGE = 0.30;
export const MIN_BOOKING_DAYS_AHEAD = 3;

export const BOOKING_STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  pending_confirmation: 'Pending Confirmation',
  confirmed: 'Confirmed',
  menu_locked: 'Menu Locked',
  advance_paid: 'Advance Paid',
  in_preparation: 'In Preparation',
  event_day: 'Event Day',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export const BOOKING_TIMELINE_STAGES = [
  { stage: 'confirmed', label: 'Booking Confirmed', index: 0 },
  { stage: 'menu_locked', label: 'Menu Locked', index: 1 },
  { stage: 'advance_paid', label: 'Advance Paid', index: 2 },
  { stage: 'in_preparation', label: 'In Preparation', index: 3 },
  { stage: 'event_day', label: 'Event Day', index: 4 },
  { stage: 'completed', label: 'Service Complete', index: 5 },
] as const;

export const QUICK_REPLIES = [
  'Can we add a dessert counter?',
  "What's the setup time?",
  'Do you provide live counters?',
  'Can we customize the menu?',
  'What are the cancellation terms?',
  'Do you have tasting sessions?',
];

export const PORTION_RECOMMENDATIONS = {
  starters: { perHead: 3, unit: 'pieces' },
  mains: { perHead: 250, unit: 'grams' },
  rice: { perHead: 150, unit: 'grams' },
  desserts: { perHead: 2, unit: 'pieces' },
  beverages: { perHead: 2, unit: 'glasses' },
};
