# PropertyHub - Property & Service Request Management

## Overview

PropertyHub is a property management web application that allows users to manage properties and submit/track service requests. The application provides a dashboard for viewing statistics, property management capabilities, and a service request ticketing system with priority levels and status tracking.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript, using Vite as the build tool
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state management and caching
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens and CSS variables for theming
- **Theme Support**: Light/dark mode with localStorage persistence

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **API Design**: RESTful API with JSON responses under `/api` prefix
- **Storage Pattern**: Interface-based storage abstraction (`IStorage`) with in-memory implementation (`MemStorage`)
- **Build Process**: Custom esbuild script for server bundling, Vite for client

### Data Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Validation**: Zod schemas generated from Drizzle schemas via drizzle-zod
- **Database**: PostgreSQL (configured via `DATABASE_URL` environment variable)
- **Current Storage**: In-memory storage for development; database schema ready for PostgreSQL

### Key Design Patterns
- **Monorepo Structure**: Client (`client/`), server (`server/`), and shared code (`shared/`)
- **Path Aliases**: `@/` for client source, `@shared/` for shared code
- **Schema Sharing**: Database schemas and types defined in `shared/schema.ts` used by both frontend and backend
- **API Client**: Centralized `apiRequest` function with error handling in `queryClient.ts`

### Data Models
- **Users**: Basic authentication model with username/password
- **Properties**: Property records with name, address, type, and units
- **Service Requests**: Tickets linked to properties with title, description, category, priority, and status

## External Dependencies

### Database
- PostgreSQL database connection via `DATABASE_URL` environment variable
- Drizzle Kit for database migrations (`npm run db:push`)

### UI Framework Dependencies
- Radix UI primitives for accessible components
- Tailwind CSS for styling
- Lucide React for icons
- React Hook Form with Zod resolver for form handling

### Development Tools
- Vite with React plugin and HMR
- Replit-specific plugins for development (cartographer, dev-banner, error overlay)
- TypeScript with strict mode

### Session Management
- connect-pg-simple configured for PostgreSQL session storage (available but not currently active)