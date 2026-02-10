export type RootStackParamList = {
  '(auth)': undefined;
  '(tabs)': undefined;
  '(stack)': undefined;
};

export type AuthStackParamList = {
  onboarding: undefined;
  login: undefined;
  'verify-otp': { phone: string };
};

export type TabParamList = {
  index: undefined;
  bookings: undefined;
  messages: undefined;
  profile: undefined;
};

export type StackParamList = {
  search: { query?: string; filter?: string };
  'caterer/[id]': { id: string };
  'booking/new': { catererId: string };
  'booking/menu-select': { bookingId: string; catererId: string };
  'booking/summary': { bookingId: string };
  'booking/confirmation': { bookingId: string };
  'booking/[id]/track': { id: string };
  'booking/[id]/review': { id: string };
  'booking/[id]/chat': { id: string };
  'portion-planner': { catererId?: string };
  settings: undefined;
  addresses: undefined;
  referral: undefined;
};
