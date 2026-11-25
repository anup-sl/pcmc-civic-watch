# PCMC CivicWatch: Quick-Snap Reporting Mode Specification

**Product**: PCMC CivicWatch (Vite + React PWA with Supabase backend)
**Reference**: PMC "Bhau Flex Kadha" portal (`https://bhauflexkadha.pmc.gov.in/`)
**Target**: Add a "Quick-Snap" reporting mode alongside the existing comprehensive category/form reporting flow
**Author**: Spec (Business & Product Analyst)
**Date**: 2026-11-24

---

## 1. Overview

The "Quick-Snap" mode provides a streamlined, camera-first reporting experience inspired by the Bhau Flex Kadha portal. It enables citizens to report civic issues with minimal friction: one tap to capture a photo, automatic GPS tagging, and instant anonymous tracking — without navigating through category selection, sub-tags, or optional fields.

This mode coexists with the existing full reporting flow (`ReportTab.tsx`). Users can switch between "Standard Report" and "Quick-Snap Report" pathways.

---

## 2. User Stories & Acceptance Criteria

| ID | User Story | Acceptance Criteria |
|----|------------|---------------------|
| **QS-1** | As a citizen, I want to open the camera immediately from the home screen so I can report an issue I witness in real-time. | • Tapping the "Quick-Snap" button on the home screen instantly prompts the device camera with `capture="environment"`<br>• Camera preview opens immediately after capture without requiring category selection first |
| **QS-2** | As a citizen, my report should be automatically tagged with my GPS location so I don't need to type my ward/prabhag. | • Browser geolocation runs on report submission<br>• GPS coordinates are reverse-geocoded to extract area name<br>• Auto-generated area display shows "Pimpri Chinchwad, Ward X" based on location<br>• User can edit the auto-detected area if needed |
| **QS-3** | As a citizen, I want my report to be anonymous by default so I won't face retaliation. | • No citizen name or contact fields are shown in Quick-Snap mode<br>• A persistent privacy banner reads: "Anonymous. Your identity is never revealed."<br>• Optional name/contact can be added later via a separate "Add Details" step |
| **QS-4** | As a citizen, I want a simple 3-step visual guide so I know what each action does. | • Three visual cards displayed sequentially:<br>   1. 📷 **Snap Photo** – takes/captures the issue photo<br>   2. 📍 **Auto-Location** – confirms/edits GPS location<br>   3. 🛡️ **Municipal Action** – submits the report and shows tracking ID |
| **QS-5** | As a citizen, I want to check my report status using only a reference code, without logging in. | • After submission, a ticket ID is displayed in format `SS-YYYYMMDD-ABBB` (e.g., `SS-261123-AB2C`)\n• The home screen features a single-field tracker: "Enter reference code to check status"\n• No authentication required; lookup works via reference code only |
| **QS-6** | As a citizen, I want the quick-snap report to be validated for prohibited content before submission. | • Image moderation scan runs instantly after photo capture<br>• Blocked content (private homes, vehicle plates, vulgar content) shows an error and prevents submission<br>• Only legitimate outdoor municipal issues (potholes, garbage, drainage, lighting) are allowed |
| **QS-7** | As a citizen, I want the report to be geo-fenced to PCMC jurisdiction so it reaches the right municipal authority. | • GPS coordinates are checked against PCMC boundary<br>• If outside PCMC, user is prompted to edit the area or select a valid prabhag/ward<br>• GPS watermark is automatically stamped on the photo with area/ward/timestamp |

---

## 3. Field Requirements & Default Fallbacks

### 3.1 Minimal Valid Report Metadata

| Field | Source | Default / Fallback | Required |
|-------|--------|-------------------|----------|
| **photo** | Device camera capture | None — required to submit | ✅ Yes |
| **latitude** | Browser Geolocation API | PCMC center coordinates (18.6313, 73.8256) | ✅ Yes |
| **longitude** | Browser Geolocation API | PCMC center coordinates (18.6313, 73.8256) | ✅ Yes |
| **area_name** | Reverse geocode of GPS | "Pimpri Chinchwad" (from geocode) | ✅ Yes |
| **category** | Auto-suggest based on image content OR "Other" | "Other" (if content moderation cannot classify) | ⚠️ Conditional |
| **sub_tag** | Auto-derived from category or first sub-tag | First sub-tag of auto-selected category | ⚠️ Conditional |
| **notes** | Optional free-text | Empty string (not required) | ❌ No |
| **citizen_name** | Not shown in Quick-Snap | N/A (omitted) | ❌ No |
| **citizen_contact** | Not shown in Quick-Snap | N/A (omitted) | ❌ No |

### 3.2 Category Handling in Quick-Snap

Three strategies, in order of preference:

1. **Image-Content Auto-Classify**: Run `analyzeImageContent(file)` immediately after capture. If the model confidently maps to a category (pothole, drainage, etc.), auto-select that category and its first sub-tag.
2. **1-Tap Category Chip**: If auto-classification confidence is low, show a single row of 3-category chips (Pothole, Drainage, Garbage) for the user to tap. Default to "Other" if none fit.
3. **Manual "Other" Selection**: Always allow the user to select "Other" and add a custom 1-line note.

**Default Fallback**: If image analysis fails or is blocked, auto-select category "Other" with sub-tag "Other" and proceed with GPS + photo only.

### 3.3 GPS & Location Fallbacks

- **Primary**: Browser Geolocation (high accuracy, 8s timeout)
- **Secondary**: If geolocation fails or is denied, use device's last known location (if available)
- **Tertiary**: Fixed PCMC center coordinates (18.6313, 73.8256) with area "Pimpri Chinchwad"
- **User Override**: Always allow manual area edit after auto-detection

### 3.4 Ticket ID Generation

- Format: `SS-YYYYMMDD-ABBB`
  - `SS` = "Shikayat" (Marathi for "complaint") or "Service Request" prefix
  - `YYYYMMDD` = submission date
  - `ABBB` = 3-character random alphanumeric (e.g., `AB2C`, `Z9KL`)
- Generated client-side immediately after successful Supabase insert
- Shown prominently on the submission success screen and saved to localStorage for the tracker

---

## 4. Ticket Tracking Workflow

### 4.1 Reference ID Format

```
SS-261123-AB2C
^ ^   ^
| |   └── 3-char random alphanumeric
| └───── Date: Nov 26, 2026
└─────── Prefix: SS
```

### 4.2 Lookup Flow (Home Screen)

1. User navigates to the "Track Your Report" section on the home screen
2. Single input field appears: "Enter reference code (e.g. SS-261123-AB2C)"
3. On submit, app queries Supabase `reports` table by `photo_url` or hotspot `id` (matching the uploaded photo's metadata)
4. Results displayed:
   - Issue category and sub-tag
   - Location (area name + ward)
   - Status: OPEN / CHRONIC_REOPENED / RESOLVED
   - Corroboration count (if applicable)
   - SLA hours remaining
   - Option to view on map

**Note**: Lookup uses the photo's stored metadata (area_name + category) to find the matching hotspot, not the reference ID directly in Supabase. The reference ID is primarily a user-facing identifier.

### 4.3 Anonymous Tracking Backend

- Each report insertion generates the ticket ID and stores it in the `reports` table alongside `hotspot_id`
- The `reports` table schema already supports this (`report_type`, `photo_url`, `notes`, `created_at`)
- No user authentication or profile required — lookup is purely metadata-driven

---

## 5. User Interface Specification

### 5.1 Quick-Snap Home Button

**Location**: Bottom navigation bar (new tab icon), or a floating action button on the home screen.

**Visual**: Camera icon with circular border, labeled "Quick-Snap" in the current language.

**Behavior**:
- Tapping opens the camera interface (see 5.2)
- If a photo is already pending (user paused mid-flow), resume from where they left off

### 5.2 Quick-Snap Capture Flow (3-Step Cards)

**Step 1: 📷 Snap Photo**
- Full-screen camera viewfinder with capture button
- `capture="environment"` for rear camera by default
- After capture: preview shows instant thumbnail
- Proceeds automatically to Step 2

**Step 2: 📍 Auto-Location**
- GPS accuracy indicator: `±XX m`
- Auto-detected area: "Pimpri Chinchwad, Ward X"
- Edit button allows manual area change
- Proceeds automatically to Step 3

**Step 3: 🛡️ Municipal Action**
- Summary card showing:
  - Photo preview (thumbnail)
  - Auto-detected category (e.g., "Pothole")
  - Location (area + ward)
  - SLA expected resolution time
- "Submit" button finalizes the report
- On success: ticket ID displayed (`SS-261123-AB2C`) + "Track" button

### 5.3 Privacy Banner (Persistent)

Displayed at the top of every Quick-Snap screen:

```
निनावी. तुमची ओळख कधीही उघड केली जात नाही।
Anonymous. Your identity is never revealed.
```

- Shown in Marathi Devanagari and English
- No input fields collect personal info by default
- Optional "Add Name/Contact" link hidden by default; leads to a separate non-Quick-Snap flow

### 5.4 Submission Success Screen

After submit, show:
1. ✅ Confetti animation
2. Ticket ID: `SS-261123-AB2C` (large, copy-to-click)
3. "Track Your Report" button → navigates to single-field tracker
4. "Report Another" button → resets flow for new Quick-Snap
5. Optional: "Send to PCMC" button → dispatches official email (same as standard flow)

---

## 6. Technical Implementation Plan

### 6.1 New Component: `QuickSnapTab.tsx`

**New file** in `src/components/`, analogous to `ReportTab.tsx` but with the streamlined flow.

**Key differences from `ReportTab.tsx`**:
- No category selection grid (or auto-only)
- No sub-tag pills
- No proximity detection alert (20m Haversine check removed for brevity)
- No citizen contact info fields
- Simplified submission params (only photo, lat, lng, areaName, category)
- GPS watermark stamping still applied
- Ticket ID generation and localStorage tracking

### 6.2 Updated `supabase.ts` / `ReportTab.tsx` Integration

- **New function** `submitQuickCivicReport(params)` — similar to `submitCivicReport` but with minimal fields:
  ```typescript
  interface QuickSubmitParams {
    category: Category;
    latitude: number;
    longitude: number;
    areaName: string;
    photoBlob: Blob | File;
    notes?: string; // optional
    slaHours: number; // default per category or 48h
  }
  ```
- Reuses existing `uploadCivicPhoto`, `haversineDistanceMeters`, and `stampGPSWatermark`
- Reuses existing `submitCivicReport` logic for hotspot matching/corroboration/creation, but called with minimal params

### 6.3 Ticket ID Generator (Utility)

```typescript
export function generateTicketId(): string {
  const now = new Date();
  const datePart = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}`;
  const randomPart = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `SS-${datePart}-${randomPart}`;
}
```

### 6.4 Home Screen Integration

- Add `QuickSnapTab` to the bottom navigation (alongside `MapTab`, `ReportTab`, `LeaderboardTab`)
- Conditional rendering: show "Quick-Snap" FAB on home when no report is in progress

### 6.5 Privacy & Moderation

- Reuse existing `analyzeImageContent` from `contentModeration.ts`
- Reuse existing `stampGPSWatermark` from `watermark.ts`
- Same privacy banner text in Marathi + English
- Same content block rules apply

---

## 7. Handoff Checklist for Blueprint / Guardian

| Item | Status | Notes |
|------|--------|-------|
| ✅ `QuickSnapTab.tsx` component created with 3-step flow | ☐ | Design mockup needed |
| ✅ Camera FAB + `capture="environment"` configured | ☐ | Requires `accept="image/*"` + `ref` input |
| ✅ GPS auto-location with PCMC boundary check | ☐ | Use existing `grabLiveGPS` + `resolveAddressForCoords` |
| ✅ GPS watermark stamping on photo | ☐ | Reuse `stampGPSWatermark` from `watermark.ts` |
| ✅ Image moderation scan (`analyzeImageContent`) | ☐ | Reuse existing utility |
| ✅ Ticket ID generation (`SS-YYYYMMDD-ABBB` format) | ☐ | New utility function |
| ✅ Single-field tracker on home screen | ☐ | New component or extend existing |
| ✅ Privacy banner (Marathi + English) | ☐ | Copy from Bhau Flex Kadha spec |
| ✅ Submit success screen with confetti + ticket ID | ☐ | Reuse confetti from `ReportTab.tsx` |
| ✅ Bottom nav integration (Quick-Snap tab) | ☐ | Add to `BottomNav.tsx` |
| ✅ Backward compatibility: Standard report flow unchanged | ☐ | New component coexists with `ReportTab.tsx` |

---

## 8. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| GPS denied/failed → falls back to PCMC center | Report submitted for wrong area | Always show auto-detected area + "Edit" button; user can manually correct |
| Image moderation blocks valid civic photos | User frustration, lost report | Show clear block reason; allow "Other" category manual selection as fallback |
| Reference ID lookup fails without exact metadata | User can't track their report | Lookup uses area_name + category matching; add fallback to search by date range |
| Category auto-classification wrong | Wrong hotspot created, confusion | Always show selected category before submit; allow user to change to "Other" before final submit |
| Duplicate ticket IDs (race condition) | Two users get same ID | Use `Date.now()` + cryptographically random 4-char suffix; negligible collision risk |

---

## 9. Success Metrics (Post-Launch)

- **Quick-Snap adoption**: % of total reports submitted via Quick-Snap mode (target: 30% in first month)
- **Completion rate**: % of Quick-Snap flows that finish vs. abort (target: >85%)
- **Ticket lookup usage**: % of submitters who later check their ticket status (target: >40%)
- **Moderation block rate**: % of Quick-Snap photos blocked by content moderation (target: <5%)
- **GPS accuracy**: % of reports with area_name correctly auto-detected (target: >90% within PCMC)

---

## 10. Open Questions & Decisions Needed

1. **Category auto-classification confidence threshold** — at what confidence level does the image model auto-select a category vs. showing the 1-tap chip row?
2. **Ticket ID prefix** — `SS` for "Shikayat" (Marathi) or `SR` for "Service Request" (English)? Or localized dynamically?
3. **Privacy banner wording** — final Marathi/English copy approval needed (currently: "निनावी. तुमची ओळख कधीही उघड केली जात नाही." / "Anonymous. Your identity is never revealed.")
4. **Bottom nav label** — "Quick-Snap" or "Snap" or a camera icon-only button?
5. **Whether to merge Quick-Snap into ReportTab as a mode** or keep as separate tab — recommended: separate tab for clear UX isolation.

--- 

*End of Specification*