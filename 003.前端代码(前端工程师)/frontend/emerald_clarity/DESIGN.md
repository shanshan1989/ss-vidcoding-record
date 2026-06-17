---
name: Emerald Clarity
colors:
  surface: '#f4fbf4'
  surface-dim: '#d4dcd5'
  surface-bright: '#f4fbf4'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eef6ee'
  surface-container: '#e8f0e9'
  surface-container-high: '#e3eae3'
  surface-container-highest: '#dde4dd'
  on-surface: '#161d19'
  on-surface-variant: '#3c4a42'
  inverse-surface: '#2b322d'
  inverse-on-surface: '#ebf3eb'
  outline: '#6c7a71'
  outline-variant: '#bbcabf'
  surface-tint: '#006c49'
  primary: '#006c49'
  on-primary: '#ffffff'
  primary-container: '#10b981'
  on-primary-container: '#00422b'
  inverse-primary: '#4edea3'
  secondary: '#5c5f60'
  on-secondary: '#ffffff'
  secondary-container: '#e1e3e4'
  on-secondary-container: '#626566'
  tertiary: '#a43a3a'
  on-tertiary: '#ffffff'
  tertiary-container: '#fc7c78'
  on-tertiary-container: '#711419'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#6ffbbe'
  primary-fixed-dim: '#4edea3'
  on-primary-fixed: '#002113'
  on-primary-fixed-variant: '#005236'
  secondary-fixed: '#e1e3e4'
  secondary-fixed-dim: '#c5c7c8'
  on-secondary-fixed: '#191c1d'
  on-secondary-fixed-variant: '#454748'
  tertiary-fixed: '#ffdad7'
  tertiary-fixed-dim: '#ffb3af'
  on-tertiary-fixed: '#410005'
  on-tertiary-fixed-variant: '#842225'
  background: '#f4fbf4'
  on-background: '#161d19'
  surface-variant: '#dde4dd'
  warning-yellow: '#F59E0B'
  alert-red: '#EF4444'
  text-main: '#1F2937'
  text-muted: '#6B7280'
  border-light: '#E5E7EB'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-md:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  number-xl:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  number-md:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 32px
---

## Brand & Style

The design system is built for a personal finance tool that prioritizes **financial health, focus, and intentionality**. The brand personality is professional yet refreshing, moving away from the cold, clinical nature of traditional banking apps toward a supportive and growth-oriented companion.

The design style is **Minimalist / Modern**. It leverages generous whitespace to reduce cognitive load in data-heavy views and employs a **card-based layout** to modularize information. Tactile elements like soft shadows and subtle transitions are used to make the interface feel responsive and trustworthy, while high-quality functional icons provide immediate visual cues for categorization. The goal is to make the act of bookkeeping feel "light" rather than a chore.

## Colors

The palette is centered around **Emerald Green**, symbolizing vitality and balanced financial growth. This primary color is used for call-to-action buttons, successful states, and primary brand accents.

The background system utilizes a range of **Soft Grays** (starting from `#F9FAFB`) to create a layered hierarchy without the harshness of pure white or high-contrast lines. Semantic colors are strictly reserved for functional feedback:
- **Warning Yellow (#F59E0B)**: Specifically for budget alerts (80% threshold).
- **Alert Red (#EF4444)**: Specifically for overspending or negative balances.
- **Neutrals**: Used for text and structural borders to maintain high legibility and a clean aesthetic.

## Typography

This design system uses **Inter** for all roles to maintain a systematic, utilitarian, and clean appearance. The hierarchy is designed to highlight financial data above all else.

- **Display & Numbers**: Large, bold weights are used for balance totals and "today's spending" to ensure immediate recognition.
- **Labels**: Uppercase and slightly increased letter spacing are used for secondary categories or metadata to distinguish them from actionable text.
- **Hierarchy**: Headlines scale down for mobile devices to prevent text wrapping on small screens while maintaining readability.

## Layout & Spacing

The layout follows a **fluid grid** model with a consistent **8px spatial rhythm**. 

- **Mobile**: A single-column layout with 16px side margins. Cards span the full width minus margins.
- **Desktop/Tablet**: A multi-column approach where content is grouped into cards that reflow based on screen width.
- **Padding**: Generous internal padding (24px) within cards prevents data density from feeling overwhelming.
- **Gutters**: A standard 16px gutter is used between cards to provide clear separation without wasting excessive space.

## Elevation & Depth

Visual hierarchy is achieved through a combination of **tonal layers** and **ambient shadows**. 

- **The Canvas**: The base background uses a soft neutral tint.
- **The Cards**: Primary content containers are pure white (`#FFFFFF`) with a very soft, diffused shadow (0px 4px 20px, 5% opacity black). This makes the cards appear slightly lifted from the background.
- **Interaction**: On hover or active state, cards can transition to a slightly deeper shadow to signify interactivity.
- **Structural Lines**: Use low-contrast outlines (`#E5E7EB`) for internal divisions within cards (like list items) instead of shadows to keep the interface clean.

## Shapes

The shape language is **Rounded**, conveying a friendly and modern feel that softens the "seriousness" of financial data. 

- **Cards & Primary Containers**: 1rem (16px) corner radius.
- **Buttons & Inputs**: 0.5rem (8px) corner radius.
- **Small Elements (Chips/Tags)**: 0.25rem (4px) or full pill-shaped for status indicators.

## Components

- **Buttons**: Primary buttons use the Emerald Green background with white text. Ghost buttons use an Emerald Green outline for secondary actions like "Add Note."
- **Numbers & Keypads**: The numeric keypad in the quick-entry view should be large, with clean typography and no borders—relying on spacing and soft background changes on tap.
- **Budget Progress Bars**: Horizontal bars with a gray track. The fill color shifts from Emerald Green to Warning Yellow (80%) and Alert Red (100%+).
- **Category Chips**: Icons inside circles or squarcles with soft background tints corresponding to the category color, paired with `label-sm` text.
- **Transaction Lists**: Each entry should show the category icon on the left, name/note in the center, and the amount on the right (using `number-md`). Amounts for expenditures should be prefixed with a minus sign or highlighted in neutral-dark.
- **Cards**: Use white cards for distinct sections like "Monthly Overview" or "Recent Transactions." Every card should have a 1px border (`border-light`) or the ambient shadow defined in the Elevation section.