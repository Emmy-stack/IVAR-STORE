-- =============================================================================
-- IVAR STORE: Seed Data
-- =============================================================================

-- Seed initial accounts
INSERT INTO public.accounts (
    id,
    product_id,
    slug,
    title,
    description,
    price,
    level,
    rank,
    skin_count,
    bundle_count,
    rare_skins,
    rare_bundles,
    emotes,
    weapons,
    tags,
    status,
    published,
    featured
) VALUES
(
    'a1000000-0000-0000-0000-000000000001',
    'IVAR-FF-0001',
    'grandmaster-ak47-blue-flame-draco-max',
    'Level 85 Grandmaster | AK47 Blue Flame Draco (Max Lv 7) + Cyber Legend Bundle',
    'Ultimate high-tier Free Fire account. Fully maxed AK47 Blue Flame Draco Evo Gun with full dragon kill effects, exclusive Cyber Legend illuminated bundle, Grandmaster badge, and high K/D ratio. Clean email bind, fast delivery.',
    85000,
    85,
    'Grandmaster',
    145,
    62,
    ARRAY['AK47 Blue Flame Draco (Lv 7 Max)', 'M1014 Green Flame Draco', 'SCAR Megalodon Alpha (Lv 5)', 'Gloowall Cyber Shield'],
    ARRAY['Cyber Legend Suit', 'Arctic Blue Bundle', 'Shadow Earthshaker'],
    ARRAY['Dragon Roar', 'Doggie Dance', 'Throne Emote', 'Flowers of Love'],
    ARRAY['AK47 Draco', 'M1014 Draco', 'AWM Swallowtail', 'Katana Blood Moon'],
    ARRAY['Grandmaster', 'Evo Gun Max', 'Rare Bundle', 'High Level'],
    'available',
    true,
    true
),
(
    'a2000000-0000-0000-0000-000000000002',
    'IVAR-FF-0002',
    'og-season-1-sakura-bundle-master-rank',
    'OG Season 1 Sakura Bundle | Master Rank IV | Rare Collector Locker',
    'Super rare OG collection account featuring the coveted Season 1 Elite Pass Sakura Bundle and matching kimono accessories. Master Rank IV with 4,850+ rank points, Evo M1014, and 28,000+ diamonds badge history.',
    120000,
    72,
    'Master',
    198,
    84,
    ARRAY['Evo M1014 Green Flame', 'AWM Wavebreaker', 'Katana Sakura Bloom'],
    ARRAY['Season 1 Sakura Bundle (Full OG)', 'Hip Hop Season 2 Hat', 'Red Criminal Mask'],
    ARRAY['Tea Time', 'Selfie', 'Arm Wave', 'Push Up'],
    ARRAY['M1014 Evo', 'Groza Operano', 'Desert Eagle Golden'],
    ARRAY['OG Sakura', 'Season 1', 'Master', 'Collector'],
    'available',
    true,
    true
),
(
    'a3000000-0000-0000-0000-000000000003',
    'IVAR-FF-0003',
    'level-78-heroic-predatory-cobra-mp40',
    'Level 78 Heroic Rank | MP40 Predatory Cobra + 15 Evo Guns Arsenal',
    'Stacked competitive weapon locker account. Includes MP40 Predatory Cobra, AK47 Blue Flame Draco, Katana Blood Moon, and 45+ gun skins with boosted damage attributes. Ideal for Clash Squad and Tournament scrims.',
    65000,
    78,
    'Heroic',
    112,
    48,
    ARRAY['MP40 Predatory Cobra (Lv 6)', 'SCAR Megalodon Alpha', 'Katana Blood Moon', 'M1014 Green Flame'],
    ARRAY['Crimson Knight Bundle', 'Street Boy Bundle', 'Samurai Bundle'],
    ARRAY['Cobra Dance', 'Sitar Solo', 'Eat My Dust', 'Pirate Flag'],
    ARRAY['MP40 Cobra', 'AK47 Draco', 'Katana Blood Moon', 'UMP Wilderness Hunter'],
    ARRAY['Heroic', 'MP40 Cobra', 'Competitive', 'Fast Delivery'],
    'available',
    true,
    false
)
ON CONFLICT (product_id) DO NOTHING;

-- Seed initial images for accounts
INSERT INTO public.account_images (
    id,
    account_id,
    storage_path,
    sort_order,
    is_primary
) VALUES
(
    'b1000000-0000-0000-0000-000000000001',
    'a1000000-0000-0000-0000-000000000001',
    '/images/sample-acc-1.jpg',
    0,
    true
),
(
    'b1000000-0000-0000-0000-000000000002',
    'a1000000-0000-0000-0000-000000000001',
    '/images/sample-acc-3.jpg',
    1,
    false
),
(
    'b2000000-0000-0000-0000-000000000001',
    'a2000000-0000-0000-0000-000000000002',
    '/images/sample-acc-2.jpg',
    0,
    true
),
(
    'b3000000-0000-0000-0000-000000000001',
    'a3000000-0000-0000-0000-000000000003',
    '/images/sample-acc-3.jpg',
    0,
    true
),
(
    'b3000000-0000-0000-0000-000000000002',
    'a3000000-0000-0000-0000-000000000003',
    '/images/sample-acc-1.jpg',
    1,
    false
)
ON CONFLICT (id) DO NOTHING;
