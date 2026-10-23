-- =============================================================================
-- IVAR STORE: Database Schema & Row Level Security (RLS)
-- Target: Supabase PostgreSQL
-- Authorized Admin: socialmeda03@gmail.com
-- =============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. ACCOUNTS TABLE
CREATE TABLE IF NOT EXISTS public.accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT,
    price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
    level INTEGER CHECK (level >= 1),
    rank TEXT,
    skin_count INTEGER DEFAULT 0,
    bundle_count INTEGER DEFAULT 0,
    rare_skins TEXT[] DEFAULT '{}',
    rare_bundles TEXT[] DEFAULT '{}',
    emotes TEXT[] DEFAULT '{}',
    weapons TEXT[] DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'sold')),
    published BOOLEAN NOT NULL DEFAULT true,
    featured BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexing for high-performance search and filtering
CREATE INDEX IF NOT EXISTS idx_accounts_published ON public.accounts(published);
CREATE INDEX IF NOT EXISTS idx_accounts_status ON public.accounts(status);
CREATE INDEX IF NOT EXISTS idx_accounts_price ON public.accounts(price);
CREATE INDEX IF NOT EXISTS idx_accounts_rank ON public.accounts(rank);
CREATE INDEX IF NOT EXISTS idx_accounts_featured ON public.accounts(featured);
CREATE INDEX IF NOT EXISTS idx_accounts_created_at ON public.accounts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_accounts_slug ON public.accounts(slug);
CREATE INDEX IF NOT EXISTS idx_accounts_product_id ON public.accounts(product_id);

-- 2. ACCOUNT IMAGES TABLE
CREATE TABLE IF NOT EXISTS public.account_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_account_images_account_id ON public.account_images(account_id);
CREATE INDEX IF NOT EXISTS idx_account_images_sort_order ON public.account_images(account_id, sort_order ASC);

-- 3. STORE SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.store_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    hero_video_url TEXT,
    hero_poster_url TEXT DEFAULT '/images/hero-poster.jpg',
    hero_title TEXT NOT NULL DEFAULT 'Find Your Next Legendary FF Account.',
    hero_subtitle TEXT NOT NULL DEFAULT 'Discover rare bundles, exclusive skins, and legendary collections.',
    hero_video_enabled BOOLEAN NOT NULL DEFAULT true,
    whatsapp_number TEXT NOT NULL DEFAULT '07041545267',
    telegram_number TEXT NOT NULL DEFAULT '07047673903',
    telegram_url TEXT NOT NULL DEFAULT 'https://t.me/ivarstore',
    sell_account_message TEXT NOT NULL DEFAULT 'Hey, I want to sell my account...',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert default store settings record if not exists
INSERT INTO public.store_settings (
    id,
    hero_poster_url,
    hero_title,
    hero_subtitle,
    hero_video_enabled,
    whatsapp_number,
    telegram_number,
    telegram_url,
    sell_account_message
) VALUES (
    'default',
    '/images/hero-poster.jpg',
    'Find Your Next Legendary FF Account.',
    'Discover rare bundles, exclusive skins, and legendary collections.',
    true,
    '07041545267',
    '07047673903',
    'https://t.me/ivarstore',
    'Hey, I want to sell my account...'
) ON CONFLICT (id) DO NOTHING;

-- 4. AUTO-UPDATE UPDATED_AT TRIGGER
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_accounts_updated_at ON public.accounts;
CREATE TRIGGER trigger_accounts_updated_at
    BEFORE UPDATE ON public.accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_store_settings_updated_at ON public.store_settings;
CREATE TRIGGER trigger_store_settings_updated_at
    BEFORE UPDATE ON public.store_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- Helper function to verify admin email
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (auth.jwt() ->> 'email') = 'socialmeda03@gmail.com';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- --- ACCOUNTS POLICIES ---

-- Public can read ONLY published accounts
DROP POLICY IF EXISTS "Public can view published accounts" ON public.accounts;
CREATE POLICY "Public can view published accounts"
    ON public.accounts
    FOR SELECT
    USING (published = true OR public.is_admin());

-- Only authorized admin can insert accounts
DROP POLICY IF EXISTS "Admin can insert accounts" ON public.accounts;
CREATE POLICY "Admin can insert accounts"
    ON public.accounts
    FOR INSERT
    WITH CHECK (public.is_admin());

-- Only authorized admin can update accounts
DROP POLICY IF EXISTS "Admin can update accounts" ON public.accounts;
CREATE POLICY "Admin can update accounts"
    ON public.accounts
    FOR UPDATE
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Only authorized admin can delete accounts
DROP POLICY IF EXISTS "Admin can delete accounts" ON public.accounts;
CREATE POLICY "Admin can delete accounts"
    ON public.accounts
    FOR DELETE
    USING (public.is_admin());

-- --- ACCOUNT IMAGES POLICIES ---

-- Public can view images for published accounts, admin can view all
DROP POLICY IF EXISTS "Public can view account images" ON public.account_images;
CREATE POLICY "Public can view account images"
    ON public.account_images
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.accounts a
            WHERE a.id = account_images.account_id
            AND (a.published = true OR public.is_admin())
        )
    );

-- Only admin can insert account images
DROP POLICY IF EXISTS "Admin can insert account images" ON public.account_images;
CREATE POLICY "Admin can insert account images"
    ON public.account_images
    FOR INSERT
    WITH CHECK (public.is_admin());

-- Only admin can update account images
DROP POLICY IF EXISTS "Admin can update account images" ON public.account_images;
CREATE POLICY "Admin can update account images"
    ON public.account_images
    FOR UPDATE
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Only admin can delete account images
DROP POLICY IF EXISTS "Admin can delete account images" ON public.account_images;
CREATE POLICY "Admin can delete account images"
    ON public.account_images
    FOR DELETE
    USING (public.is_admin());

-- --- STORE SETTINGS POLICIES ---

-- Public can read store settings
DROP POLICY IF EXISTS "Public can view store settings" ON public.store_settings;
CREATE POLICY "Public can view store settings"
    ON public.store_settings
    FOR SELECT
    USING (true);

-- Only admin can update store settings
DROP POLICY IF EXISTS "Admin can update store settings" ON public.store_settings;
CREATE POLICY "Admin can update store settings"
    ON public.store_settings
    FOR UPDATE
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin can insert store settings" ON public.store_settings;
CREATE POLICY "Admin can insert store settings"
    ON public.store_settings
    FOR INSERT
    WITH CHECK (public.is_admin());

-- =============================================================================
-- STORAGE BUCKETS & POLICIES (Supabase Storage)
-- =============================================================================

-- Ensure buckets exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('account-images', 'account-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public)
VALUES ('hero-media', 'hero-media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage RLS: Public read access for images and videos
DROP POLICY IF EXISTS "Public read access for account images" ON storage.objects;
CREATE POLICY "Public read access for account images"
    ON storage.objects FOR SELECT
    USING (bucket_id IN ('account-images', 'hero-media'));

-- Storage RLS: Admin upload access
DROP POLICY IF EXISTS "Admin upload access" ON storage.objects;
CREATE POLICY "Admin upload access"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id IN ('account-images', 'hero-media')
        AND (auth.jwt() ->> 'email') = 'socialmeda03@gmail.com'
    );

-- Storage RLS: Admin update access
DROP POLICY IF EXISTS "Admin update access" ON storage.objects;
CREATE POLICY "Admin update access"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id IN ('account-images', 'hero-media')
        AND (auth.jwt() ->> 'email') = 'socialmeda03@gmail.com'
    );

-- Storage RLS: Admin delete access
DROP POLICY IF EXISTS "Admin delete access" ON storage.objects;
CREATE POLICY "Admin delete access"
    ON storage.objects FOR DELETE
    USING (
        bucket_id IN ('account-images', 'hero-media')
        AND (auth.jwt() ->> 'email') = 'socialmeda03@gmail.com'
    );
