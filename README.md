# IVAR STORE — Free Fire Account Marketplace

A marketplace for authentic Free Fire (FF) gaming accounts, featuring esports aesthetics, video hero banner, real-time database-backed search and filters, image galleries, dynamic WhatsApp purchasing, and an admin dashboard.

---

## 🎮 Key Features

- **Esports Gaming Aesthetics**: Designed with a palette of Electric Blue (`#2563FF`), Bright Cyan (`#00A3FF`), Deep Navy (`#080D1A`), and Card Background (`#111A2E`), complete with cyber glows, rank badges, and animations.
- **Dynamic Hero Section**: Features Free Fire gameplay background playback with dark overlay, custom headline, subheadings, and admin video controls.
- **Database-Backed Account Listings**:
  - Live search across title, product ID (`IVAR-FF-XXXX`), rank, level, evo guns, bundles, emotes, and tags.
  - Multi-tier filtering for Min/Max Price, Rank (Grandmaster, Master, Heroic, Diamond, etc.), and Level.
  - Sorters: Featured First, Newest First, Price Low to High, Price High to Low.
  - Status badges for **Available** (emerald), **Reserved** (amber), and **Sold** (crimson).
- **Account Details & Image Gallery**:
  - Multi-image gallery with clickable thumbnail selector, Next/Prev navigation controls, and full-screen Lightbox modal.
  - Detailed weapon arsenal and collection breakdown.
  - **Buy Now on WhatsApp**: Automatically generates dynamic `wa.me` links prefilled with the actual Product ID, Title, and Price in Nigerian Naira (₦).
- **Want to Sell Your Account?**:
  - Integrated into Navbar, Homepage, Below Listings, and Footer.
  - Direct WhatsApp link prefilled with: `"Hey, I want to sell my account..."`.
- **Protected Admin Dashboard**:
  - Exclusively authorized for: `socialmeda03@gmail.com`.
  - Clerk authentication with strict server-side authorization enforcement for the verified admin email.
  - **Overview**: Real-time stats (Total Listings, Available, Reserved, Sold) and recent additions/updates.
  - **Manage Accounts**: Interactive table with inline status changers, featured toggles, edit, preview, and delete confirmation dialogs.
  - **Add & Edit Accounts**: Auto-generates Product IDs (`IVAR-FF-XXXX`), multi-image uploader with primary image selector, rank, evo guns, bundles, emotes, tags, and draft/published toggle.
  - **Hero Video Management**: Upload gameplay video (up to 100MB), upload fallback posters, toggle video on/off, edit headline/subheading, and preview live.
  - **Contact Settings**: Update WhatsApp and Telegram numbers with automatic Nigerian number normalization (`07041545267` -> `2347041545267`).

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router with Turbopack)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 with custom esports glow utilities
- **Database**: Supabase PostgreSQL with Row Level Security (RLS)
- **Authentication**: Clerk (strictly restricted to verified `socialmeda03@gmail.com`)
- **Storage**: Supabase Storage (`account-images` & `hero-media` buckets)
- **Icons**: Lucide React
- **Deployment**: Vercel-ready

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+ (tested on Node v24)
- npm 9+

### 2. Environment Variables Configuration
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Configure your Supabase credentials in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-secret-key
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
ADMIN_EMAIL=socialmeda03@gmail.com
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

> **Note on Local Development**: If Supabase credentials are not configured, local development uses a file-backed JSON database (`src/lib/data/local-db.json`) and local uploads (`public/uploads/`). On Vercel/production, configure Supabase and the server-only service role key; local files are not persistent there. Clerk verifies the admin identity before server-side service-role operations, and the service role key must never be exposed to browser code.

### 3. Database Migration & Schema (Supabase)
To set up your Supabase database:
1. Open your [Supabase Dashboard](https://supabase.com/dashboard).
2. Go to the **SQL Editor**.
3. Run the SQL script located in `supabase/migrations/001_initial_schema.sql`.
4. Run `supabase/migrations/002_admin_storage_limits.sql` on existing projects to set persistent media upload size limits.
5. (Optional) Run `supabase/seed.sql` to populate initial high-tier Free Fire account listings.

The migration sets up:
- `accounts` table with indexes for fast search and price filtering.
- `account_images` table with cascading foreign keys.
- `store_settings` table for hero video and contact channels.
- Row Level Security (RLS) policies allowing public read of published listings, while restricting all write and draft operations to `socialmeda03@gmail.com`.
- Public Storage buckets for `account-images` and `hero-media`.

### 4. Running the Application Locally
```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the live marketplace.

---

## 🔐 Administrator Access

1. Open [http://localhost:3000/admin/login](http://localhost:3000/admin/login).
2. Enter the authorized email: `socialmeda03@gmail.com`.
3. Enter your administrator password.
4. Access the full dashboard at `/admin`.

---

## 📱 WhatsApp & Telegram Configuration

| Channel | Default Value | Click-to-Chat Format |
|---|---|---|
| **WhatsApp** | `07041545267` | `https://wa.me/2347041545267` |
| **Telegram** | `07047673903` | `https://t.me/ivarstore` |

### Buy Now WhatsApp Message Template
```
Hello IVAR STORE, I want to buy this Free Fire account.

Product ID: [actual product ID]
Account Title: [actual account title]
Price: ₦[actual price]

Is this account still available?
```

### Want to Sell Account WhatsApp Message
```
Hey, I want to sell my account...
```

All phone numbers are automatically normalized to remove leading zeros for international Nigerian format (`234...`).

---

## ☁️ Deployment (Vercel)

1. Push this repository to GitHub or GitLab.
2. Import the project into [Vercel](https://vercel.com).
3. Set the Environment Variables in Vercel Project Settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ADMIN_EMAIL` (`socialmeda03@gmail.com`)
   - `NEXT_PUBLIC_SITE_URL` (your production domain)
4. Deploy!
