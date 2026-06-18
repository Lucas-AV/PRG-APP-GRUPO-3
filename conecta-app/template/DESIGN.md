# Design System Strategy: The Elevated Service Curator

## 1. Overview & Creative North Star
This design system moves beyond the utility of a "standard marketplace" to establish a **"Precision Minimalist"** aesthetic. Our goal is to transform the 'ConectaApp' experience into a high-end editorial gallery of services. 

The Creative North Star is **"The Invisible Grid."** We reject the cluttered, "boxed-in" look of traditional apps. Instead, we use intentional white space, extreme typographic scale, and tonal layering to guide the eye. By removing 1px borders and heavy dividers, we create an interface that feels like a premium digital concierge—sophisticated, effortless, and hyper-organized.

---

## 2. Color & Tonal Architecture
We utilize a Material 3-inspired palette focused on a "Grayscale Plus" philosophy. The neutral base provides a quiet stage, allowing the Primary Blue to act as a definitive "Command Color."

### The "No-Line" Rule
**Explicit Instruction:** Do not use 1px solid borders to define sections or cards. 
Structure is achieved through background shifts:
- **Level 0 (Base):** `surface` (#f9f9f9)
- **Level 1 (Sections):** `surface_container_low` (#f2f4f4)
- **Level 2 (Active Elements):** `surface_container` (#ebeeef)

### Surface Hierarchy & Nesting
Treat the UI as a physical stack of materials. 
- **The Ground:** Use `surface_bright` for the main app background.
- **The Inset:** Use `surface_container_highest` for search bars or input fields to create a "recessed" feel.
- **The Lift:** Use `surface_container_lowest` (#ffffff) for foreground cards sitting on top of `surface_dim`.

### Signature Textures
- **The Glass Factor:** For floating Navigation Bars or Action Sheets, use `surface` with a 0.8 opacity and a 20px Backdrop Blur.
- **The Gradient Soul:** Main CTAs should not be flat. Apply a subtle linear gradient from `primary` (#0054d6) to `primary_dim` (#004abd) at 135° to give buttons a tactile, pressurized feel.

---

## 3. Typography: Editorial Authority
We pair **Manrope** (Display/Headlines) with **Inter** (Body/Labels) to balance character with legibility.

- **Display-LG to Headline-SM (Manrope):** Use these for high-impact service categories and merchant names. The wide apertures of Manrope convey modern authority.
- **Body-LG to Label-SM (Inter):** These are for functional data. Use `on_surface_variant` (#5a6061) for secondary body text to create a clear "read/skim" hierarchy.
- **The Scale Jump:** To break the template look, avoid middle-ground sizes. Pair a `headline-lg` title directly with a `body-sm` caption for a dramatic, editorial contrast.

---

## 4. Elevation & Depth
We replace traditional shadows with **Tonal Layering** and **Ambient Light.**

- **The Layering Principle:** A card should be defined by being `surface_container_lowest` (Pure White) against a `surface` (Off-white) background.
- **Ambient Shadows:** Only use shadows for high-priority floating actions (e.g., FABs). 
    - *Specs:* Blur: 32px, Y-Offset: 8px, Color: `on_surface` at 4% opacity. 
- **The "Ghost Border":** If a component requires a boundary (e.g., a selected state), use `outline_variant` (#adb3b4) at 20% opacity. Never use 100% black or grey borders.

---

## 5. Component Strategy

### Buttons & CTAs
- **Primary:** Use the "Signature Gradient" (Primary to Primary Dim). Corner radius: `DEFAULT` (0.5rem/8px). High-contrast `on_primary` text.
- **Secondary:** Use `secondary_container` background with `on_secondary_container` text. No border.
- **Tertiary:** Purely typographic using `primary` color, sitting on `transparent`.

### Cards (The "ConectaApp" Signature)
- **Grid & Carousel:** No borders. Use `surface_container_lowest` for the card body. 
- **Spacing:** Use `spacing-4` (1rem) for internal padding. 
- **Imagery:** Service images must have a `md` (0.75rem/12px) corner radius to feel softer than the container.

### Lists & Segmented Controls
- **Lists:** Forbid divider lines. Separate items using `spacing-5` (1.25rem) vertical padding. Highlight the active item with a `surface_container_high` background.
- **Segmented Control:** A "pill" shape using `full` radius. The "Selected" state is a `surface_container_lowest` "floating" chip inside a `surface_container_highest` track.

### Search Bars
- **Style:** Recessed. Use `surface_container_highest` with a `full` (9999px) radius. 
- **Iconography:** Use a 20px optical size for icons, colored in `outline`.

---

## 6. Do’s and Don’ts

### Do
- **DO** use asymmetry. Place a `headline-lg` title on the left and a small `label-md` "View All" link on the far right with significant white space between.
- **DO** use `spacing-8` (2rem) between major sections to let the design breathe.
- **DO** use `primary_container` (#dae1ff) for subtle highlights in "Success" or "Verified" badges.

### Don't
- **DON'T** use #000000 for text. Always use `on_surface` (#2d3435) to keep the "Minimalist" softness.
- **DON'T** use 1px dividers. If you must separate content, use a 4px wide `surface_variant` bar with rounded ends, or simply a shift in background tone.
- **DON'T** crowd the edges. Maintain a minimum of `spacing-5` (1.25rem) horizontal margin for all screen content.