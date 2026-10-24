export const ADMIN_EMAIL =
  process.env.NEXT_PUBLIC_ADMIN_EMAIL ||
  process.env.ADMIN_EMAIL ||
  'socialmeda03@gmail.com';

export const DEFAULT_CONTACT = {
  whatsappNumber: '07041545267',
  whatsappInternational: '2347041545267',
  telegramNumber: '07047673903',
  telegramUrl: 'https://t.me/ivarstore',
  sellAccountMessage: 'Hey, I want to sell my account...',
};

export const BRAND_COLORS = {
  electricBlue: '#2563FF',
  brightCyan: '#00A3FF',
  deepNavy: '#080D1A',
  cardBg: '#111A2E',
  white: '#F8FAFC',
  mutedText: '#94A3B8',
};

export const FF_RANKS = [
  'Grandmaster',
  'Master',
  'Heroic',
  'Diamond',
  'Platinum',
  'Gold',
  'Silver',
  'Bronze',
] as const;

export const DEFAULT_HERO_SETTINGS = {
  title: 'Find Your Next Legendary FF Account.',
  subtitle: 'Discover rare bundles, exclusive skins, and legendary collections.',
  posterUrl: '/images/hero-poster.jpg',
  videoUrl: '',
  videoEnabled: true,
};
