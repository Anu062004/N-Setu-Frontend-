# Image asset spec — Nayasetu

Every asset drops into a wired slot: the component already exists and renders the image
automatically the moment the file is placed (missing files are silently hidden, never broken).
Files go in `public/`; reference them by absolute path (e.g. `/hero/hero-3.png`).

## Global style tokens (append to every prompt)

`Editorial documentary photograph, India, civic institutional setting, warm late-afternoon light,
muted desaturated palette of warm paper white, ink charcoal and deep indigo, fine film grain, no
text, no logos, no watermarks, dignified human presence, shot on 35mm, Swiss poster composition
with negative space`

Avoid in every prompt: `cartoon, illustration, vibrant oversaturated colors, stock-photo smiles,
glamour, text, watermark, cluttered background`

The site further applies `filter: saturate(0.88) contrast(1.04)` to hero imagery in CSS.

---

## 01 · Hero slide 3 — "The citizen"

| | |
|---|---|
| Path | `public/hero/hero-3.png` |
| Used by | `src/features/landing/HeroSlideshow.tsx` (5s slide between hero-1 and hero-4) |
| Aspect / size | 16:9, 2560×1440 (full-bleed, `object-fit: cover`) |
| Alt | "A citizen at a rural legal aid clinic" |

**Prompt**

> A woman in a simple cotton saree sitting in a rural Indian legal aid clinic waiting room,
> holding a folded paper document, soft window light from the left, warm and dignified, shallow
> depth of field, the frame mostly quiet negative space above her — editorial documentary
> photograph, India, 2026. [style tokens]

## 02 · Hero slide 4 — "The bridge"

| | |
|---|---|
| Path | `public/hero/hero-4.png` |
| Used by | `HeroSlideshow.tsx` (last slide, loops back to hero-1) |
| Aspect / size | 16:9, 2560×1440 (full-bleed) |
| Alt | "A footbridge at golden hour" |

**Prompt**

> A long modern concrete footbridge over a wide river at golden hour, a few ordinary people
> walking across it toward a city skyline in the distance, warm amber light, desaturated warm
> tones, low wide angle from below, lots of sky — editorial architectural documentary, India.
> [style tokens]

## 03 · Legal aid portrait — Rights pages

| | |
|---|---|
| Path | `public/rights/rights-img.png` |
| Used by | `src/features/landing/Rights.tsx` (sidebar card) and landing "The right to legal help" section (optional) |
| Aspect / size | 4:5, 1200×1500 (portrait card) |
| Alt | "A village dispute-resolution meeting under a tree" |

**Prompt**

> Close-up of a village dispute resolution scene: an elderly man and a younger woman in a
> panchayat-style meeting under a large tree, faces softly out of focus, a lawyer's file in the
> foreground in sharp focus, golden light through leaves — documentary, dignified, India, no
> direct eye contact with camera. [style tokens]

## 04 · Professional portraits — Provider join (three frames)

| | |
|---|---|
| Paths | `public/join/join-advocate.png` · `public/join/join-paralegal.png` · `public/join/join-mediator.png` |
| Used by | `src/features/provider/ProviderJoin.tsx` (three portrait cards) |
| Aspect / size | 4:3, 1600×1200 each |
| Alt | "Advocate outside a district court" / "Paralegal volunteer at a legal aid camp" / "Mediator in a mediation room" |

**Prompt (generate three separate frames)**

> (a) A young female advocate in a black coat holding case files outside a district court
> corridor; (b) a male paralegal volunteer at a legal aid camp desk with registration forms;
> (c) a senior male mediator in a plain shirt in a mediation room with two chairs — each frame:
> soft window light, shallow depth of field, professional but not posed, dignified, muted tones,
> India, editorial documentary. [style tokens]

## 05 · Assisted-mode kiosk

| | |
|---|---|
| Path | `public/assist/assist-kiosk.png` |
| Used by | `src/features/assisted/AssistedMode.tsx` (right column) |
| Aspect / size | 16:9, 1920×1080 |
| Alt | "A CSC operator helping a citizen at a kiosk" |

**Prompt**

> A common service centre kiosk interior: an operator helping an older citizen with no
> smartphone use a touchscreen, seen from behind the citizen over the shoulder, screen glow,
> warm interior light, documentary style, dignified — India, rural, 2026. [style tokens]

## 06 · Referral banner — court detail

| | |
|---|---|
| Path | `public/referral/referral-banner.png` |
| Used by | `src/features/citizen/Referral.tsx` (top banner) |
| Aspect / size | 16:9, 1920×1080 |
| Alt | "Supreme Court of India colonnade at blue hour" |

**Prompt**

> Close detail of the Supreme Court of India colonnade and dome at blue hour, deep indigo sky,
> warm light spilling from a few windows, symmetric frontal composition, desaturated, large
> negative space — editorial architectural photography. [style tokens]

## 07 · "Work begins transparently" — How it works

| | |
|---|---|
| Path | `public/how/how-desk.png` |
| Used by | `src/features/landing/HowItWorks.tsx` (after-routing section) |
| Aspect / size | 3:2, 1920×1280 |
| Alt | "A hand signing a fee disclosure document" |

**Prompt**

> Close-up of a hand signing a fee disclosure document with a fountain pen on a clean wooden
> desk, a stack of neatly folded case files beside it, warm window light raking across the
> paper, shallow depth of field, muted warm tones — editorial still life, India, no faces.
> [style tokens]

## 08 · Court corridor — Citizen portal

| | |
|---|---|
| Path | `public/portal/portal-corridor.png` |
| Used by | `src/features/citizen/CitizenPortal.tsx` (header strip) |
| Aspect / size | 4:3, 1600×1200 |
| Alt | "An empty court corridor with light shafts" |

**Prompt**

> A quiet empty court corridor with a notice board and an advocate in the far background
> walking away, dust in the light shafts, warm muted tones, symmetrical composition, large
> negative space — editorial architectural documentary, India. [style tokens]

## 10 · Stone and light — CTA texture (optional)

| | |
|---|---|
| Path | `public/brand/cta-texture.png` |
| Used by | (optional) landing final CTA band |
| Aspect / size | 21:7, 1920×600 |
| Alt | — (decorative) |

**Prompt**

> Abstract close-up of a stone wall with one strong diagonal beam of warm light crossing it,
> extreme minimalism, deep shadows, muted warm paper tones — editorial abstract, no text.
> [style tokens]

## 11 · Vintage jail photograph — newspaper card (rights page)

| | |
|---|---|
| Path | `public/rights/newspaper-photo.png` |
| Used by | `src/features/landing/Rights.tsx` — the Hussainara Khatoon newspaper card (embedded 4:3 photo, grayscale+sepia filter applied by CSS) |
| Aspect / size | 4:3, 1600×1200 |
| Alt | "Undertrial wing, Patna Central Jail, 1979" |

**Prompt**

> A black-and-white archival press photograph from 1979 India: a dim prison cell-block corridor
> in Patna Central Jail, a row of iron bars, a few men in plain clothes standing behind them,
> heavy film grain, high contrast, slight soft focus, visible halftone dots, gentle sepia
> aging, photograph slightly creased and dusty — documentarian, no readable text. [style tokens]

---

## Wiring status

| Asset | Wired | Component |
|---|---|---|
| hero-3.png | ✅ | HeroSlideshow (3 slides live: hero-1, hero-2, hero-3) |
| rights-img.png | ✅ | Rights.tsx sidebar (4:5) |
| newspaper-photo.png | ✅ | Rights.tsx newspaper card (4:3, B&W) |
| join-advocate.png | ✅ | ProviderJoin.tsx (frame 1 of 3) |
| join-paralegal.png / join-mediator.png | 🔲 | ProviderJoin.tsx (frames 2–3; hidden until files exist) |
| assist-kiosk.png | 🔲 | AssistedMode.tsx |
| referral-banner.png | 🔲 | Referral.tsx |
| how-desk.png | ✅ | HowItWorks.tsx (the "FEE DISCLOSURE" signature image moved here from the hero) |
| portal-corridor.png | 🔲 | CitizenPortal.tsx |
| og.png | 🔲 | index.html meta (needs absolute URL) |

All wired slots use `SmartImage` (`src/components/ui/SmartImage.tsx`): a missing file renders
nothing (no broken icon), and the image appears automatically when the file is added — no code
change needed.