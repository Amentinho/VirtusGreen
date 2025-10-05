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
- Custom color palette based on earth tones and sustainability-focused greens
- Responsive design with mobile-first approach
- Light/dark mode support through CSS custom properties
- Typography using Inter (primary) and Poppins (accents) fonts
- Component library following the "new-york" shadcn style variant

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
- In-memory storage fallback (`MemStorage`) for development/testing
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