# Design Guidelines: Premium Clothing Brand E-commerce

## Design Approach
**Reference-Based Approach** inspired by minimalist e-commerce leaders (Everlane, COS, premium Shopify stores) with emphasis on product photography and clean, spacious layouts that let the clothing speak for itself.

## Core Design Principles
- **Premium Minimalism**: Abundant whitespace, restrained elements, photography-first
- **Dark Sophistication**: Establish premium feel through dark tones with strategic accent usage
- **Product-Centric**: Every design decision highlights the clothing, not the interface

---

## Typography System

**Font Families:**
- Primary: Inter or DM Sans (Google Fonts) - clean, modern sans-serif
- Accent: Optional Playfair Display for premium headlines

**Hierarchy:**
- Hero Headlines: text-5xl to text-7xl, font-bold, tracking-tight
- Section Headers: text-3xl to text-4xl, font-semibold
- Product Titles: text-xl to text-2xl, font-medium
- Body Text: text-base to text-lg, font-normal
- Navigation/UI: text-sm to text-base, font-medium
- Captions/Labels: text-xs to text-sm, font-normal

---

## Layout & Spacing System

**Spacing Primitives:** Use Tailwind units of **4, 6, 8, 12, 16, 24** (e.g., p-4, gap-6, my-12)

**Section Padding:**
- Desktop: py-24 to py-32
- Mobile: py-12 to py-16

**Container Strategy:**
- Max-width: max-w-7xl with px-4 to px-8 margins
- Product grids: max-w-6xl for optimal viewing
- Text content: max-w-3xl for readability

**Responsive Grid System:**
- Mobile (base): Single column (grid-cols-1)
- Tablet (md:): 2 columns (grid-cols-2)
- Desktop (lg:): 3-4 columns (grid-cols-3 or grid-cols-4)
- Gap spacing: gap-6 to gap-8

---

## Component Library

### Navigation
- **Desktop**: Horizontal nav with centered logo, left-aligned menu (Shop, About, Contact), right-aligned user actions (Cart icon with count, Login/Account)
- **Mobile**: Hamburger menu with slide-out drawer, sticky header
- Height: h-16 to h-20
- Backdrop: Semi-transparent dark background with blur effect (backdrop-blur-md)

### Hero Section
**Layout:** Full-width viewport section (min-h-screen or h-[80vh])
- Large hero image showcasing featured product (hoodie/tee on model or flat lay)
- Overlay gradient (dark gradient from bottom for text legibility)
- Centered content with headline + subheadline + CTA button
- Button styling: Blurred background (backdrop-blur-md bg-white/10), prominent border, hover scale transform
- Include scroll indicator or down arrow

### Product Cards
**Structure:**
- Image container: aspect-square or aspect-[3/4], object-cover
- Product info below image: name, price, optional short description
- Hover effect: Subtle scale (scale-105), show secondary image if available
- Card spacing: p-0 (images full-bleed), text content p-4
- Border: Optional subtle border or none for cleaner look

### Product Grid
- Responsive columns as specified above
- Equal height cards using grid (not flex)
- "Load More" or pagination at bottom
- Category filters: Horizontal pill buttons or dropdown (sticky on scroll)

### Product Detail Page
**Layout:** Two-column on desktop (md:grid-cols-2), stacked on mobile
- Left: Large product image gallery (main image + thumbnails below or side)
- Right: Product info sticky on scroll
  - Product name (text-3xl)
  - Price (text-2xl, prominent)
  - Description (text-base, max-w-prose)
  - Size selector (button group or dropdown)
  - Quantity selector
  - Two CTAs: "Add to Cart" (secondary style) + "Buy Now" (primary, accent color)
  - Additional info: Accordion for shipping, returns, materials

### Admin Dashboard
- Sidebar navigation (dark background)
- Main content area with data table or card grid
- "Add Product" form: Multi-step or single page with file upload for images
- Form fields: Full-width on mobile, 2-column on desktop
- Action buttons: Prominent placement with confirmation modals for deletions

### Footer
- Multi-column layout (4 columns on desktop, stacked on mobile)
- Sections: Shop categories, About/Support links, Contact info, Social media
- Newsletter signup: Email input + submit button
- Bottom bar: Copyright, payment icons, legal links
- Spacing: py-16 to py-20

---

## Images

**Hero Section:**
- Single large hero image (1920x1080 minimum) showing model wearing featured product
- Lifestyle photography with natural lighting, neutral/complementary background
- Image should occupy full viewport width and 70-100vh height
- Apply dark gradient overlay (from-black/60 via-black/40 to-transparent) for text contrast

**Product Images:**
- High-quality product photography (minimum 1200x1200)
- Consistent white or light gray backgrounds for product grid
- Lifestyle shots for product detail pages showing clothing worn/styled
- Multiple angles: front, back, detail shots, styled/flat lay options

**Additional Imagery:**
- About page: Brand story images, behind-the-scenes photos
- Category banners: Lifestyle images representing each clothing category
- No generic stock photos - all imagery should feel authentic to the brand

---

## Interactions & Animations

**Minimal, Purposeful Motion:**
- Button hover: Subtle scale (scale-105) and background opacity shifts
- Product cards: Smooth image zoom on hover (transform duration-300)
- Page transitions: Fade in on load (opacity animation)
- Cart drawer: Slide in from right with backdrop
- Modal overlays: Fade in backdrop + scale content from 95 to 100

**Avoid:** Auto-playing carousels, parallax effects, excessive micro-animations

---

## Responsive Breakpoints

- Mobile-first approach
- sm: 640px (larger phones)
- md: 768px (tablets - switch to 2-column layouts)
- lg: 1024px (desktops - 3-4 column layouts, horizontal navigation)
- xl: 1280px (wider spacing and containers)

---

## Accessibility
- All interactive elements: Clear focus states (ring-2 ring-offset-2)
- Form inputs: Visible labels, proper contrast ratios
- Images: Descriptive alt text for all product images
- Buttons: Minimum touch target 44x44px on mobile
- Color contrast: Ensure text meets WCAG AA standards against dark backgrounds

---

## Performance Optimization
- Next.js Image component with priority loading for hero
- Lazy loading for product grid images (loading="lazy")
- Responsive image sizes using srcSet
- Optimize for Core Web Vitals: LCP < 2.5s, CLS < 0.1