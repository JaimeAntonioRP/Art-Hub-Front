---
name: Aethelgard Monolith
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#393939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#d0c5af'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#99907c'
  outline-variant: '#4d4635'
  surface-tint: '#e9c349'
  primary: '#f2ca50'
  on-primary: '#3c2f00'
  primary-container: '#d4af37'
  on-primary-container: '#554300'
  inverse-primary: '#735c00'
  secondary: '#4edea3'
  on-secondary: '#003824'
  secondary-container: '#00a572'
  on-secondary-container: '#00311f'
  tertiary: '#bfcdff'
  on-tertiary: '#082b72'
  tertiary-container: '#97b0ff'
  on-tertiary-container: '#254188'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffe088'
  primary-fixed-dim: '#e9c349'
  on-primary-fixed: '#241a00'
  on-primary-fixed-variant: '#574500'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#dbe1ff'
  tertiary-fixed-dim: '#b4c5ff'
  on-tertiary-fixed: '#00174b'
  on-tertiary-fixed-variant: '#27438a'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
typography:
  display-lg:
    fontFamily: Playfair Display
    fontSize: 64px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Playfair Display
    fontSize: 40px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Playfair Display
    fontSize: 28px
    fontWeight: '500'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Geist
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-caps:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.1em
  label-sm:
    fontFamily: Geist
    fontSize: 13px
    fontWeight: '500'
    lineHeight: '1.4'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1440px
  gutter: 32px
  margin-mobile: 20px
  margin-desktop: 64px
  stack-sm: 12px
  stack-md: 24px
  stack-lg: 48px
---

## Brand & Style

This design system is engineered to evoke the hushed, reverent atmosphere of a private high-end digital gallery. The brand personality is elite, authoritative, and clinical in its precision, ensuring that the art remains the undisputed focal point while the interface acts as a silent, sophisticated concierge.

The visual style is a fusion of **Minimalism** and **Glassmorphism**. It utilizes expansive negative space to create a sense of luxury, punctuated by razor-sharp typography and translucent surfaces that suggest depth without clutter. The aesthetic leans into a "Digital Vault" concept—secure, immutable, and curated—where every interaction feels intentional and premium.

## Colors

The palette is anchored by **Deep Charcoal (#121212)** and an even deeper **Obsidian (#0A0A0A)** to provide an infinite backdrop for digital assets. **Gold Accents (#D4AF37)** are used sparingly for primary actions, authentication seals, and high-value indicators to signify exclusivity.

For functional states, a **Validation Emerald (#10B981)** provides a clear, sophisticated success signal that contrasts against the warm gold. Surfaces utilize varying levels of opacity rather than lighter grays to maintain the "glass" aesthetic, ensuring the UI feels layered and atmospheric rather than flat.

## Typography

The typographic hierarchy relies on a dramatic contrast between the classical elegance of **Playfair Display** and the technical purity of **Geist**. 

Serif headlines are used for editorial content, artist names, and artwork titles, lending an air of tradition and provenance. The UI controls, data points, and body copy utilize the monolinear, developer-centric Geist to reinforce the platform's technological "authentication" aspect. Letter spacing is increased for uppercase labels to enhance readability and give the interface a structured, architectural feel.

## Layout & Spacing

The layout follows a **Fixed Grid** model for large screens, centering the content to create a framed gallery effect. On desktop, a 12-column grid is used with generous 64px outer margins to allow the artwork to "breathe."

Spacing is governed by an 8px base unit. Component-internal spacing is kept tight and technical (12px or 24px), while layout-level spacing between sections is expansive (48px to 120px) to maintain a premium, unhurried pace. For mobile, margins are reduced to 20px, and the grid collapses to a single-column flow with images taking full-bleed priority.

## Elevation & Depth

Hierarchy is established through **Glassmorphism** and backdrop-blur effects rather than traditional drop shadows.

1.  **Base Layer:** The deepest obsidian background (#0A0A0A).
2.  **Mid Layer:** Translucent surfaces with a 12px blur and a 1px subtle border (rgba(255, 255, 255, 0.05)) to simulate glass panels.
3.  **Top Layer:** Active modal elements or tooltips with higher opacity and a faint gold-tinted glow (5% opacity gold) to draw immediate focus.

This system avoids heavy shadows, opting instead for "Inner Glows" and "Stroke-based Depth" to maintain the crisp, minimalist aesthetic.

## Shapes

The shape language is **Soft (0.25rem)**. This subtle rounding prevents the UI from feeling overly aggressive or "brutalist" while maintaining a precise, engineered appearance. Large containers like art cards or main frames should adhere to a consistent 4px (0.25rem) corner radius. 

Circular elements are reserved exclusively for avatars and specific authentication status icons to provide a visual break from the otherwise rectangular, grid-locked layout.

## Components

### Buttons
Primary buttons use a solid Gold (#D4AF37) fill with black Geist typography for high contrast. Secondary buttons are "Ghost" style: a 1px border with a glass background and white text. All buttons use a 4px corner radius.

### Cards & Frames
Art cards feature a subtle 1px border and a backdrop blur effect. On hover, the border transitions to a Gold tint. The image should be the primary focus, with metadata appearing in `label-caps` typography at the bottom.

### Scanning & Authentication
When authenticating art, use a "Scanning Overlay"—a horizontal Gold line that moves vertically across the image with a faint trailing gradient. Success states are marked by an Emerald border and a shimmering glass icon.

### Input Fields
Inputs are minimalist: a single bottom border or a very subtle translucent container. Focus states are indicated by the border brightening to pure white or gold.

### Chips & Tags
Used for "Verified," "Unique," or "Edition" labels. These should be small, high-contrast pills with a glass background and `label-caps` text.