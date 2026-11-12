# PCMC CivicWatch

Mobile-first citizen accountability and civic issue reporting platform for Pimpri-Chinchwad Municipal Corporation (PCMC).

Built with **React + TypeScript + Vite + Tailwind CSS + Supabase + Leaflet (OpenStreetMap)**.

---

## 🌟 Key Features

### 1. 📷 Snap Report Tab
- **Camera-Only Issue Capture**: Enforces live rear camera (`capture="environment"`) to block gallery uploads and guarantee authenticity.
- **Auto Geotagging & Reverse Geocoding**: Automatically tags GPS coordinates with OpenStreetMap Nominatim reverse geocoding to resolve exact streets and Prabhags.
- **4 Civic Categories with SLAs**:
  - 🗑️ **Garbage / Waste** (48h SLA)
  - 💧 **Water / Drainage** (36h SLA)
  - ⚠️ **Potholes / Roads** (168h SLA)
  - 💡 **Streetlights / Electricity** (72h SLA)
- **20-Meter Haversine Corroboration Engine**: Automatically calculates distance against existing active hotspots. If an open issue exists within 20m, allows citizens to corroborate (+1) rather than creating duplicate pins.
- **14-Day Chronic Recurrence Detection**: If a resolved issue reoccurs within 14 days, flags it as `CHRONIC_REOPENED` for municipal vigilance audits.

### 2. 🗺️ Civic Map Tab
- **Interactive OpenStreetMap**: Full-screen free Leaflet map with zero proprietary API key requirements.
- **Color-Coded Hotspots**:
  - 🔴 **Red**: `OPEN` issues.
  - 🟣 **Purple**: `CHRONIC_REOPENED` recurring failures.
  - 🟢 **Green**: `RESOLVED` cleared locations.
- **Evidence Timeline**: Tapping any pin displays the chronological photo timeline with citizen corroboration history and SLA status.
- **Clearance Verification**: Citizens can mark issues as cleared with a mandatory live "After" photo (requires user GPS within 30m, with test mode bypass).
- **Multi-Channel Escalation**:
  - Direct WhatsApp complaint dispatch to PCMC Sarathi (`9922501450`).
  - Pre-routed email escalation to Zonal Ward Officers and Nodal Department Heads.
  - Level 2 Vigilance auto-escalation to the Municipal Commissioner and Joint Commissioner (Vigilance & Quality Control).
  - One-click HTML5 Canvas watermarked proof generator with embedded GPS, tracking ID, and timestamp.

### 3. 🏆 Leaderboard & Ward Dashboard Tab
- **Interactive Ward Incident Dashboard**: Real-time counter cards (`Open`, `Overdue`, `Resolved`, `Citizens Verified`) for any selected Prabhag across PCMC's 8 Administrative Zones (A through H).
- **Searchable Prabhag Picker**: Switch between 40+ PCMC Prabhags (*Wakad, Pimple Saudagar, Nigdi, Ravet, Chinchwad*, etc.).
- **City-wide Summary**: High-level counters and area vulnerability rankings.
- **CSV Evidence Dossier Export**: One-click download of all civic hotspots for RTI filings and Ward Committee meetings.

### 4. 🌐 Bilingual Support
- Instant bilingual toggle between **English** and **Marathi (`मराठी`)**.

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+ recommended)
- npm or pnpm

### 2. Environment Setup
Copy `.env.example` to `.env` and fill in your Supabase credentials:
```env
VITE_SUPABASE_URL=https://lxkpvqobtfstysszezwk.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Database & Storage Setup
Execute the DDL in `supabase-setup.sql` in your Supabase SQL Editor:
- Creates `hotspots` and `reports` tables with anonymous RLS policies.
- Creates public `civic-photos` storage bucket.

### 4. Install & Run
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 🏛️ PCMC Administrative Integration

The application routes escalations based on PCMC's administrative hierarchy:
- **Central Grievance**: Sarathi 24×7 (`8888006666`, `sarathi@pcmcindia.gov.in`, WhatsApp `9922501450`).
- **Leadership Tier**: Municipal Commissioner Dr. Vijay Suryawanshi (IAS) & Joint Commissioner Manoj Lonkar (Vigilance & QC).
- **Zonal Offices**: Zones A through H.
