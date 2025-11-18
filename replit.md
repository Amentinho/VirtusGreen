# VirtusGreen - Blockchain Sustainability Platform

## Overview

VirtusGreen is a blockchain-based digital product passport platform that transforms sustainability into rewards. The platform enables users to scan product barcodes, discover transparent environmental impact data stored on blockchain, and earn tokens for eco-conscious choices. For companies, it offers product listing services, Life Cycle Assessment (LCA) calculations, and sustainability consulting.

The application is built as a full-stack web platform with a React frontend and Express backend, designed to showcase the VirtusGreen brand and provide a contact mechanism for potential customers and partners.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- React 18 with TypeScript
- Vite as the build tool and development server
- Wouter for client-side routing
- TanStack Query (React Query) for data fetching and state management
- shadcn/ui component library built on Radix UI primitives
- Tailwind CSS for styling with custom design tokens

**Design System:**
- VirtusGreen brand color palette (vibrant green HSL 135, 60%, 42-45%)
- Responsive design with mobile-first approach
- Light/dark mode support through CSS custom properties
- Typography using Inter (primary) and Poppins (accents) fonts
- Component library following the "new-york" shadcn style variant
- Official VirtusGreen logo used throughout the site (navigation and footer)

**Key Features:**
- Single-page application (SPA) with smooth scroll navigation
- Intersection Observer-based animations for section reveals
- Form validation using React Hook Form with Zod schema validation
- Toast notifications for user feedback
- Fully responsive components with mobile menu support

### Backend Architecture

**Technology Stack:**
- Node.js with Express framework
- TypeScript for type safety
- ESM (ECMAScript Modules) architecture
- Vite middleware integration for development

**API Design:**
- RESTful API endpoints under `/api` prefix
- JSON request/response format
- Zod schema validation for request data
- Error handling middleware with structured error responses

**Storage Layer:**
- Drizzle ORM for database interactions
- PostgreSQL database (configured via Neon serverless driver)
- DatabaseStorage implementation with persistent data
- Database schema defined in shared code for type consistency

**Development Features:**
- Hot module replacement (HMR) via Vite
- Automatic error overlay in development
- Request/response logging middleware
- Development-only Replit plugins (cartographer, dev banner)

### Data Models

**Users Table:**
- ID (UUID, auto-generated)
- Username (unique, required)
- Password (required)

**Contact Submissions Table:**
- ID (UUID, auto-generated)
- Name (required, min 2 characters)
- Email (required, valid email format)
- Project Type (enum: Freelance, Business, Affiliate, User)
- Message (required, min 10 characters)
- Created At (timestamp, auto-generated)

**Validation Strategy:**
- Shared Zod schemas between frontend and backend
- `drizzle-zod` integration for type-safe schema creation
- Client-side and server-side validation using identical schemas

### Routing Architecture

**Frontend Routes:**
- `/` - Home page with all marketing sections
- `*` - 404 Not Found page

**Backend Routes:**
- `POST /api/contact` - Submit contact form
- `GET /api/contact` - Retrieve all contact submissions

**Build & Deployment:**
- Production build outputs to `dist/` directory
- Client assets served from `dist/public`
- Server bundled using esbuild with ESM format
- Static file serving in production mode

### State Management

**Client-Side State:**
- TanStack Query for server state caching and synchronization
- React Hook Form for form state management
- Local component state for UI interactions (animations, visibility)
- No global state management library (Context API used minimally)

**Query Configuration:**
- Infinite stale time (manual invalidation strategy)
- No automatic refetching on window focus or intervals
- 401 responses throw errors by default
- Credentials included in all requests

### Design Principles

**Visual Design:**
- Reference-based approach inspired by Stripe, Notion, and sustainability leaders
- Trust through transparency and clean design
- Environmental values expressed through natural, calming aesthetics
- Modern tech credibility via crisp interfaces and smooth interactions

**Accessibility:**
- Semantic HTML structure
- ARIA labels and roles where appropriate
- Keyboard navigation support
- Focus management for interactive elements

**Performance:**
- Code splitting via Vite
- Lazy loading for route components
- Optimized bundle size through tree-shaking
- Image optimization and responsive loading

## External Dependencies

**Database:**
- PostgreSQL (via Neon serverless)
- Accessed through `@neondatabase/serverless` driver
- Connection configured via `DATABASE_URL` environment variable
- Drizzle ORM for type-safe queries and migrations

**UI Component Library:**
- shadcn/ui (extensive Radix UI component collection)
- All Radix UI primitive packages (@radix-ui/*)
- Custom styling applied via Tailwind CSS
- Component variants managed through class-variance-authority

**Build Tools:**
- Vite for development and production builds
- esbuild for server-side bundling
- TypeScript compiler for type checking
- PostCSS with Tailwind CSS and Autoprefixer

**Validation & Forms:**
- Zod for schema validation
- React Hook Form for form management
- @hookform/resolvers for Zod integration

**Development Tools:**
- Replit-specific plugins for enhanced development experience
- Runtime error modal overlay
- Development banner
- Cartographer for code navigation

**Fonts:**
- Google Fonts (Inter, Poppins)
- Preconnected for performance optimization

**SEO & Metadata:**
- Open Graph tags for social sharing
- Twitter Card metadata
- Schema.org structured data for organization information
- Comprehensive meta tags for search optimization

## Email Notifications

**Resend Integration (Completed):**
- Contact form submissions automatically send email notifications via Resend
- Recipient email: andrea.amenta87@gmail.com
- Sender email: Configured in Resend connection settings (contact@virtusgreen.com recommended)
- Email includes: name, email, project type, and message from contact form
- Implementation: server/email.ts handles email sending
- Contact submissions are also stored in the database and can be viewed via GET /api/contact endpoint

## Recent Changes

### November 2025 - Phase 5: Checklist Page

**Checklist Page Implementation (Completed):**
- Created fully multilingual /checklist page in English, Italian, and Spanish
- Comprehensive translation keys added for all checklist content (7-day sustainable eating guide)
- VirtusGreen brand colors maintained throughout: dark teal (#043231), green (#00AF67), lime (#C0FA79), cream (#fbf9f3)
- Hero section with Free PDF badge and download button
- "What's inside" section listing all 7 days with environmental tips
- "Quick benefits" sidebar highlighting key features
- Full SEO implementation with react-helmet-async (meta tags, OG tags, Twitter cards)
- Navigation and Footer components included for consistent experience
- Cross-page navigation using hash-based routing (/#section-id)
- Placeholder PDF files created in public/assets/ with setup instructions
- Responsive design with mobile support
- Multiple download buttons throughout the page linking to language-specific PDFs

**Navigation System Updates (Completed):**
- Enhanced Navigation component to handle cross-page routing using wouter
- Hash-based navigation for links clicked from non-home pages
- Home page detects hash fragments and auto-scrolls to target sections
- URL cleanup after navigation (hash removed via window.history.replaceState)
- Reliable section scrolling from any page in the application

### October 2025 - Phase 4: Analytics Integration

**Google Analytics Setup (Completed):**
- Integrated Google Analytics 4 (GA4) with measurement ID G-V3LHEE2PLF
- Created analytics utility library (`client/src/lib/analytics.ts`) for event tracking
- Implemented automatic page view tracking using custom hook (`client/src/hooks/use-analytics.tsx`)
- Added comprehensive event tracking across all user interactions:
  - Navigation events: scroll_to_section, mobile_menu_toggle
  - Conversion events: contact_form_submit (with project type tracking)
  - Engagement events: cta_click, social_link_click, app_download_click
  - Error tracking: contact_form_error
- Environment variable VITE_GA_MEASUREMENT_ID stored securely in Replit Secrets
- All events include descriptive categories and labels for meaningful analytics
- E2E testing confirmed GA script loads and events fire correctly

### October 2025 - Phase 3: Content & Feature Updates

**Platform Status Updates (Completed):**
- Added "Coming Soon" badges to Blockchain-Verified Data and Real Rewards features
- Updated "Making a Real Impact" to "Building the Future of Sustainability" with development disclaimer
- Removed app download links (app not yet live)
- Replaced download buttons with "Get in Touch" calls-to-action
- Contact form configured to send to andrea.amenta87@gmail.com

**Feature Enhancements (Completed):**
- Added EU PEF compliance mention to LCA Calculation service
- Removed Facebook from social links (LinkedIn, Twitter, Instagram only)
- Added comprehensive Roadmap section with quarterly milestones (Q4 2024 - Q3 2025)
- Roadmap shows project phases: Foundation, Development, Beta Launch, Public Launch

### October 2025 - Phase 3: Official Branding

**Logo Integration (Completed):**
- Integrated official VirtusGreen logo throughout the website
- Logo displayed in navigation header (h-10) and footer (h-12)
- Replaced placeholder Leaf icon with actual brand logo
- Logo imported from `attached_assets/aaa_1759692758271.jpg`

**Color Palette Refinement (Completed):**
- Updated color scheme to match VirtusGreen brand identity
- Primary green: HSL(135, 60%, 42%) - vibrant, fresh green
- CTA green: HSL(135, 65%, 45%) - brighter accent for call-to-action
- Success green: HSL(135, 60%, 45%) - consistent brand color
- Applied consistently across light and dark modes
- All buttons, accents, and highlights use brand colors

### October 2025 - Phase 2 Features

**Database Migration (Completed):**
- Migrated from in-memory storage to PostgreSQL database
- Contact submissions now persist permanently with UUID primary keys
- Implemented DatabaseStorage class using Drizzle ORM
- Proper ordering by createdAt timestamp (newest first)

**App Download Links (Completed):**
- Added platform detection for iOS, Android, and desktop users
- Enhanced detection for modern iPadOS devices (MacIntel + touch support)
- Integrated tracking parameters for attribution (ct/utm tracking)
- App Store URL: `https://apps.apple.com/us/app/virtusgreen/id123456789?mt=8&ct=hero-cta`
- Play Store URL: `https://play.google.com/store/apps/details?id=com.virtusgreen.app&referrer=utm_source%3Dwebsite%26utm_medium%3Dhero-cta`
- Opens in new tab with noopener,noreferrer for security