# VirtusGreen Design Guidelines

## Design Approach
**Reference-Based Approach** drawing inspiration from modern SaaS and sustainability-focused platforms:
- **Stripe**: Clean layouts, subtle animations, professional color usage
- **Notion**: Clear hierarchy, generous whitespace, user-friendly interactions  
- **Sustainability Leaders**: Earth-conscious aesthetics with modern execution

**Core Principles:**
- Trust through transparency and clean design
- Environmental values expressed through natural, calming aesthetics
- Modern tech credibility via crisp interfaces and smooth interactions

## Color Palette

### Light Mode (Primary)
- **Primary Green**: 145 45% 35% (earth-tone, trustworthy)
- **Background**: 0 0% 100% (pure white)
- **Surface**: 140 20% 96% (subtle warm gray)
- **Text Primary**: 150 15% 15% (deep charcoal)
- **Text Secondary**: 150 10% 45% (medium gray)
- **Accent CTA**: 145 65% 42% (vibrant green for primary actions)
- **Success**: 140 50% 45% (sustainable action feedback)

### Dark Mode Support
- **Background**: 150 15% 10% (deep green-tinted black)
- **Surface**: 150 12% 15% (elevated surfaces)
- **Text Primary**: 140 10% 95% (off-white)
- **Accent remains vibrant**: 145 65% 48%

## Typography

**Font Stack**: Inter (primary), Poppins (accents), system fallbacks

### Hierarchy
- **H1 (Hero)**: 3.5rem (56px) bold, tracking -0.02em
- **H2 (Sections)**: 2.5rem (40px) bold, tracking -0.01em  
- **H3 (Subsections)**: 1.75rem (28px) semibold
- **Body Large**: 1.125rem (18px) regular, line-height 1.6
- **Body**: 1rem (16px) regular, line-height 1.6
- **Caption**: 0.875rem (14px) medium

**Responsive Scaling**: Reduce heading sizes by 25% on mobile

## Layout System

**Spacing Units**: Consistent use of Tailwind units 4, 8, 12, 16, 20, 24, 32
- **Section Padding**: py-20 (desktop), py-12 (mobile)
- **Container Max Width**: max-w-7xl for full sections, max-w-6xl for content
- **Grid Gaps**: gap-8 (cards), gap-4 (list items)
- **Component Spacing**: mb-4 (tight), mb-8 (standard), mb-16 (section breaks)

**Multi-Column Strategy**:
- Hero: Single column, centered (max-w-4xl)
- How It Works: 3 columns desktop (grid-cols-1 md:grid-cols-3)
- Environmental Metrics: 3 columns desktop (grid-cols-2 lg:grid-cols-3)  
- Why VirtusGreen: 3 columns desktop
- For Companies: 3 service cards (grid-cols-1 md:grid-cols-3)
- Stats: 4 columns (grid-cols-2 lg:grid-cols-4)

## Component Library

### Navigation
- Sticky header with backdrop blur (backdrop-blur-md bg-white/80)
- Logo left, menu center, CTAs right
- Mobile: Hamburger menu with slide-in drawer
- Active state: border-b-2 accent color

### Hero Section  
- Full-width background with subtle gradient mesh
- Large hero image: Person scanning product with phone (right side or background)
- Trust badges as icon + text pills below CTAs
- CTA buttons: Primary (solid accent), Secondary (outline with blurred background)

### Cards (Features, Services, Metrics)
- Rounded corners: rounded-xl (12px)
- Shadow: subtle on hover (hover:shadow-lg transition)
- Padding: p-6 to p-8
- Icon top, heading, description, optional CTA

### Buttons
- **Primary**: bg-accent text-white, px-8 py-3, rounded-lg, min-h-[44px]
- **Secondary**: border-2 border-accent text-accent, backdrop-blur on images
- **Hover**: Slight scale (hover:scale-105) and shadow enhancement
- No custom hover states on outline buttons over images

### Forms (Contact Footer)
- Input fields: border rounded-lg, p-3, focus:ring-2 focus:ring-accent
- Dropdown: Custom styled select with chevron icon
- Submit button: Full-width primary style
- Field spacing: space-y-4

### Environmental Metrics Icons
- Icon grid with 6 items (2x3 mobile, 3x2 desktop)
- Icon size: 48px in circle backgrounds
- Hover reveals expanded description (transform scale & opacity)
- Icons: Heroicons or Font Awesome CDN

### Team Card (Founder)
- Photo: rounded-full (150px) or rounded-xl square
- Name: text-2xl font-bold
- Title/Role: text-lg text-secondary  
- Quote: italic, text-accent
- Card: centered, max-w-md

## Animations

**Scroll Animations** (Intersection Observer):
- Fade-in: opacity 0→1, duration 600ms
- Slide-up: translateY(30px)→0, duration 600ms  
- Stagger children: 100ms delay between items

**Interaction Animations**:
- Button hover: scale(1.05), duration 200ms
- Card hover: shadow-lg, translateY(-4px), duration 300ms
- Scan animation (How It Works): Pulsing ring effect with barcode visual

**Performance**: Use transform and opacity only, hardware-accelerated

## Images

### Required Images:
1. **Hero Image**: Modern person/hand scanning product barcode with phone (right 50% or full-width background with overlay)
2. **How It Works Visual**: Illustrated or photographic sequence showing scan→data→reward flow
3. **Founder Photo**: Professional headshot of Andrea (circular or square)
4. **Background Elements**: Subtle geometric patterns or gradient meshes (optional accents)

### Image Treatment:
- Lazy loading: loading="lazy"
- Responsive sizes: srcset for different viewports
- Rounded corners: rounded-xl on standalone images
- Overlay gradients on hero if text overlaps image

## Responsive Breakpoints
- Mobile: < 768px (single column, stacked)
- Tablet: 768px - 1024px (2 columns where applicable)
- Desktop: > 1024px (full multi-column layouts)
- Touch targets: min 44px height on mobile

## SEO & Performance
- Semantic HTML5: header, nav, main, section, footer
- Heading hierarchy: Single H1 (hero), H2 for sections, H3 for subsections
- Alt text: Descriptive for all images (include keywords naturally)
- Meta tags: Title (60 chars), description (155 chars), Open Graph
- Schema: Organization + Product markup in JSON-LD
- Performance: Minify assets, lazy load images, defer non-critical JS

## Accessibility
- Color contrast: WCAG AA minimum (4.5:1 text, 3:1 UI)
- Focus states: visible ring on all interactive elements
- Keyboard navigation: logical tab order, skip links
- ARIA labels: for icon-only buttons and decorative elements
- Form labels: visible or aria-label for all inputs

## Key Interactions
- Smooth scroll to sections on nav click (behavior: smooth)
- Sticky CTA: "Download App" appears on scroll past hero
- Barcode scan demo: Animated SVG or Lottie in How It Works section
- Metric cards: Hover to expand details (no click required)
- Mobile menu: Slide-in from right with overlay