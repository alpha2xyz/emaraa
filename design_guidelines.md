# Design Guidelines: Property & Service Request Application

## Design Approach
**System-Based Approach** inspired by modern productivity tools (Linear, Notion, Asana) combined with property management platforms like Buildium. This utility-focused application prioritizes efficiency, clarity, and task completion while maintaining visual appeal.

## Core Design Elements

### Typography
- **Primary Font**: Inter (Google Fonts) - clean, readable, professional
- **Headings**: Font weights 600-700, sizes from text-3xl (page titles) to text-lg (section headers)
- **Body Text**: Font weight 400, text-base for content, text-sm for secondary info
- **Labels & Meta**: Font weight 500, text-sm, tracking-wide for form labels and badges

### Layout System
**Spacing Primitives**: Use Tailwind units of 2, 4, 6, 8, 12, 16, 20, 24 for consistent rhythm
- Component padding: p-4 to p-8
- Section spacing: py-12 to py-20
- Card gaps: gap-4 to gap-6
- Container max-width: max-w-7xl for main content, max-w-2xl for forms

## Component Library

### Navigation
- **Top Navigation Bar**: Sticky header with logo, main navigation links, user profile dropdown, notification bell
- Include quick-access "Submit Request" button prominently in header
- Mobile: Hamburger menu with slide-in drawer

### Dashboard Layout
- **Sidebar Navigation** (desktop): Fixed left sidebar (w-64) with request categories, property filters, quick stats
- **Main Content Area**: Two-column grid on desktop (2/3 main feed, 1/3 sidebar for filters/recent activity)
- **Request Feed**: Card-based layout with priority indicators, status badges, timestamps

### Forms
- **Request Submission Form**: Multi-step if complex (property selection → issue details → attachments)
- Grouped field sets with clear visual separation (border-t dividers)
- Required field indicators (asterisk)
- Inline validation with helpful error messages below fields
- Large textarea for descriptions (min-h-32)
- File upload area with drag-and-drop visual indicator

### Cards
- **Request Cards**: Elevated cards (shadow-md) with rounded corners (rounded-lg)
- Card structure: Header (request type + priority badge), body (description preview), footer (status + timestamp + assigned user)
- Hover state: subtle shadow increase (hover:shadow-lg transition)
- Status badges: Small pill badges (rounded-full px-3 py-1) - Open, In Progress, Completed, Urgent

### Data Display
- **Property List**: Grid layout (grid-cols-1 md:grid-cols-2 lg:grid-cols-3) showing property cards with thumbnail, address, active request count
- **Request Table** (alternative view): Sortable columns for ID, Property, Type, Priority, Status, Date, Assigned To
- **Status Timeline**: Vertical timeline component showing request progression with timestamps

### Buttons & Actions
- **Primary CTA**: Solid button (px-6 py-3 rounded-lg font-medium)
- **Secondary Actions**: Outlined button variant (border-2)
- **Icon Buttons**: Square or circular for compact actions (filter, sort, more options)
- **Floating Action Button**: Fixed bottom-right "Quick Submit" for mobile

### Overlays
- **Modal Forms**: Centered modal (max-w-2xl) for quick request submission
- **Slideout Panel**: Right-side slideout for request details/editing
- **Toast Notifications**: Top-right position for success/error feedback

## Page-Specific Layouts

### Landing Page (if public-facing)
1. **Hero Section** (h-screen): Large hero with property management imagery, headline "Streamline Your Property Requests", CTA buttons
2. **Features Grid**: 3-column showcase of key features (Submit Requests, Track Progress, Communicate)
3. **How It Works**: 3-step process with icons and descriptions
4. **CTA Section**: "Get Started" with demo request or signup form

### Dashboard Home
- Welcome header with user name and property overview stats (total properties, active requests, completion rate)
- Quick actions section: prominent "New Request" card + "View All Properties" + "Contact Support"
- Recent requests feed (5-8 most recent)
- Right sidebar: Upcoming maintenance, announcements, priority alerts

### Request Detail View
- Full-width header with request ID, property address, status badge
- Two-column layout: Left (request details, description, attachments), Right (activity timeline, assigned team member, actions)
- Comment/update section at bottom

## Icons
**Library**: Heroicons (outline for navigation, solid for emphasis)
- Use consistently: home, document-text, wrench, bell, user-circle, plus-circle, filter, search

## Images
**Hero Image**: Yes - professional property management photo (modern building exterior or clean maintenance workspace) with subtle overlay for text readability
**Property Thumbnails**: Placeholder for property photos in listings (aspect-ratio-video, rounded-lg)
**Empty States**: Friendly illustrations for "no requests yet" states
**Avatar Placeholders**: User profile images in circular format

## Animations
**Minimal, Purposeful Only**:
- Smooth transitions on card hover (transition-shadow duration-200)
- Modal fade-in (opacity + scale)
- Slide-in for mobile menu
- Status badge color transitions
- No scroll-triggered or decorative animations

## Accessibility
- Consistent focus indicators (ring-2 ring-offset-2) on all interactive elements
- ARIA labels on icon-only buttons
- Semantic HTML throughout (main, section, article, aside)
- Form labels properly associated with inputs

**Overall Aesthetic**: Clean, professional, and trustworthy - balancing modern design with practical functionality for property managers and residents to efficiently handle service requests.