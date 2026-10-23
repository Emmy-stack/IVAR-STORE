export type AccountStatus = 'available' | 'reserved' | 'sold';

export type AccountRank = 
  | 'Grandmaster' 
  | 'Master' 
  | 'Heroic' 
  | 'Diamond' 
  | 'Platinum' 
  | 'Gold' 
  | 'Silver' 
  | 'Bronze'
  | 'Unranked';

export interface AccountImage {
  id: string;
  account_id: string;
  storage_path: string;
  sort_order: number;
  is_primary: boolean;
  created_at?: string;
}

export interface Account {
  id: string;
  product_id: string; // e.g. IVAR-FF-0001
  slug: string;
  title: string;
  description: string;
  price: number; // in NGN
  level: number;
  rank: string;
  skin_count: number;
  bundle_count: number;
  rare_skins: string[];
  rare_bundles: string[];
  emotes: string[];
  weapons: string[];
  tags: string[];
  status: AccountStatus;
  published: boolean;
  featured: boolean;
  created_at: string;
  updated_at: string;
  images?: AccountImage[];
}

export interface StoreSettings {
  id: string;
  hero_video_url?: string | null;
  hero_poster_url: string;
  hero_title: string;
  hero_subtitle: string;
  hero_video_enabled: boolean;
  whatsapp_number: string;
  telegram_number: string;
  telegram_url: string;
  sell_account_message: string;
  updated_at?: string;
}

export interface AccountFilterOptions {
  query?: string;
  rank?: string;
  minPrice?: number;
  maxPrice?: number;
  minLevel?: number;
  status?: AccountStatus | 'all';
  sortBy?: 'newest' | 'price_asc' | 'price_desc' | 'featured';
}

export interface DashboardStats {
  totalListings: number;
  availableCount: number;
  reservedCount: number;
  soldCount: number;
  recentAdded: Account[];
  recentUpdated: Account[];
}
