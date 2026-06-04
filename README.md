# Team Inspire Care - Hospital Management System

A modern, full-stack hospital management system built with Next.js, Supabase, and Tailwind CSS. Features patient appointment booking and comprehensive admin management dashboard.

![Team Inspire Care Logo](public/hospital-logo.png)

## Key Features

### 👥 Patient Portal
- **Appointment Booking**: Multi-step appointment booking wizard
- **Doctor Profiles**: Browse doctors by specialization with experience and consultation fees
- **Services Catalog**: Explore hospital services and procedures
- **Patient Reviews**: Read and rate doctor experiences
- **Hospital Gallery**: View facility images and amenities
- **Contact Form**: Direct communication with hospital

### 🏥 Admin Dashboard
- **Appointment Management**: Review, approve, or reject patient bookings
- **Doctor Management**: Add, edit, and remove doctors with availability
- **Services Management**: Create and manage hospital services
- **Gallery Management**: Upload and organize facility images
- **Real-time Updates**: Instant data synchronization across the platform

### 🔐 Security
- Row Level Security (RLS) on all database tables
- User-specific data access
- Admin-only management operations
- Protected routes with authentication

## Technology Stack

- **Frontend**: Next.js 16 with React 19
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS 4
- **Authentication**: Supabase Auth + Custom Session
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Language**: TypeScript

## Getting Started

### Prerequisites
- Node.js 18+ and npm/pnpm
- Supabase account and project
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/team-inspire-care.git
cd team-inspire-care
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Configure environment variables**

Create a `.env.local` file with:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Get these from [Supabase Dashboard](https://supabase.com/dashboard) → Settings → API

4. **Run development server**
```bash
pnpm dev
```

Visit `http://localhost:3000`

## Database Schema

The system includes 10 main tables with comprehensive RLS policies:

| Table | Purpose | Public Access |
|-------|---------|-----------------|
| `users` | Patients & admin profiles | User-specific |
| `departments` | Medical specialties | Read-only |
| `doctors` | Doctor profiles | Read-only |
| `services` | Hospital services | Read-only |
| `appointments` | Patient bookings | User-specific |
| `doctor_availability_slots` | Doctor schedules | Read-only |
| `reviews` | Patient ratings | Approved only |
| `gallery` | Facility images | Active only |
| `notifications` | Admin alerts | Admin-only |
| `emergency_contacts` | Emergency numbers | Read-only |

## Project Structure

```
team-inspire-care/
├── app/
│   ├── page.tsx                    # Homepage
│   ├── layout.tsx                  # Root layout with metadata
│   ├── globals.css                 # Design tokens & styles
│   ├── admin/
│   │   ├── login/page.tsx          # Admin login
│   │   └── dashboard/page.tsx      # Dashboard main
│   └── auth/
│       └── callback/route.ts       # Auth callback
├── components/
│   ├── Navigation.tsx              # Header navigation
│   ├── Hero.tsx                    # Landing hero
│   ├── Services.tsx                # Services section
│   ├── Doctors.tsx                 # Doctors listing
│   ├── Testimonials.tsx            # Patient reviews
│   ├── Gallery.tsx                 # Hospital gallery
│   ├── Contact.tsx                 # Contact form
│   ├── Footer.tsx                  # Footer
│   ├── AppointmentBooking.tsx      # Booking modal
│   └── admin/
│       ├── AdminSidebar.tsx        # Dashboard sidebar
│       ├── AppointmentsManager.tsx # Appointments CRUD
│       ├── DoctorsManager.tsx      # Doctors CRUD
│       ├── ServicesManager.tsx     # Services CRUD
│       └── GalleryManager.tsx      # Gallery CRUD
├── lib/
│   └── supabase/
│       ├── client.ts               # Browser client
│       ├── server.ts               # Server client
│       └── proxy.ts                # Middleware proxy
├── middleware.ts                   # Auth middleware
├── package.json
└── SETUP_GUIDE.md                  # Detailed setup
```

## Quick Start Guide

### For Users
1. Visit homepage
2. Click "Book Appointment"
3. Select doctor → date/time → enter details
4. Confirm booking
5. Admin reviews and confirms

### For Admins
1. Visit `/admin/login`
2. Enter credentials (demo: `admin@teaminspirecare.com` / `admin123`)
3. Access dashboard to manage:
   - Appointments (approve/reject)
   - Doctors (add/edit profiles)
   - Services (create offerings)
   - Gallery (upload images)

## Design System

### Color Palette
- **Primary Blue**: #1565c0 - Trust, healthcare
- **Navy**: #0f172a - Professional
- **Emerald Green**: #10b981 - Health, growth
- **Coral Pink**: #f43f5e - Energy, care
- **Gold**: #f59e0b - Premium

### Typography
- **Heading Font**: Geist (System default)
- **Body Font**: Geist (System default)

### Responsive Design
- Mobile-first approach
- Tablet and desktop optimized
- Smooth transitions and interactions

## Deployment

### Deploy to Vercel

1. **Push to GitHub**
```bash
git add .
git commit -m "Deploy to Vercel"
git push origin main
```

2. **Connect to Vercel**
   - Go to [Vercel](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables in project settings

3. **Add Environment Variables**
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. **Deploy**
   - Click "Deploy"
   - Site goes live at your Vercel URL

### Custom Domain
Update Supabase settings for your custom domain redirect URLs.

## API Integration

The system uses Supabase directly with no separate API layer. Benefits:
- Real-time synchronization
- Built-in authentication
- Row Level Security
- Automatic backups

## Authentication

### Admin Login
- Email/password based
- Session stored in localStorage
- Protected routes check auth on load
- Demo credentials provided

### Patient Data
- No login required for browsing
- Appointments scoped to patient email
- Email confirmation for booking

## Performance Optimizations

- Server-side rendering with Next.js
- Image optimization
- CSS code splitting
- Lazy component loading
- Efficient database queries with RLS
- Minimal client-side JavaScript

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Android)

## Security Features

- **RLS Policies**: All tables protected
- **CSRF Protection**: Built-in Next.js middleware
- **XSS Prevention**: React sanitization
- **SQL Injection Prevention**: Parameterized queries via Supabase
- **Environment Secrets**: Sensitive data in env vars only

## Troubleshooting

### Appointments Not Loading
```
❌ Check: Supabase env vars configured
✅ Solution: Verify NEXT_PUBLIC_SUPABASE_URL in .env.local
```

### Admin Login Not Working
```
❌ Check: localStorage enabled
✅ Solution: Clear browser cache, try incognito mode
```

### Services Not Displaying
```
❌ Check: is_active = true in database
✅ Solution: Use admin dashboard to add services
```

## Development Commands

```bash
# Install dependencies
pnpm install

# Development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Linting
pnpm lint

# Format code
pnpm format
```

## Contributing

1. Create feature branch (`git checkout -b feature/amazing-feature`)
2. Commit changes (`git commit -m 'Add feature'`)
3. Push to branch (`git push origin feature/amazing-feature`)
4. Open Pull Request

## License

This project is licensed under the MIT License - see LICENSE file for details.

## Support & Contact

- **Website**: Coming soon
- **Email**: support@teaminspirecare.com
- **Emergency**: +91-XXXX-XXXX-99
- **Location**: Mumbai, Maharashtra, India

## Roadmap

- [ ] SMS notifications for appointments
- [ ] Video consultation integration
- [ ] Patient mobile app
- [ ] Insurance integration
- [ ] Medical records management
- [ ] Payment gateway integration
- [ ] Multi-language support
- [ ] Analytics dashboard

## Acknowledgments

Built with:
- [Next.js](https://nextjs.org/) - React framework
- [Supabase](https://supabase.com/) - Open source Firebase
- [Tailwind CSS](https://tailwindcss.com/) - Utility CSS
- [Lucide Icons](https://lucide.dev/) - Icons
- [Vercel](https://vercel.com/) - Deployment

---

**Version**: 1.0.0  
**Last Updated**: June 2026  
**Status**: Production Ready ✅

Made with ❤️ for Team Inspire Care
