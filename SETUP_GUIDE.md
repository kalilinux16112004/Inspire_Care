# Team Inspire Care Hospital Management System - Setup Guide

## Project Overview

Team Inspire Care is a full-stack hospital management system built with Next.js, Supabase, and Tailwind CSS. The system includes:

- **Public Website**: Patient-facing appointment booking, doctor profiles, services, gallery, and testimonials
- **Admin Dashboard**: Complete management system for appointments, doctors, services, and gallery
- **Database**: Comprehensive Supabase schema with Row Level Security (RLS) policies
- **Real-time Features**: Live data synchronization and notifications

## Environment Setup

### 1. Supabase Configuration

The application requires Supabase environment variables. Add these to your `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**How to find your credentials:**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to Settings → API
4. Copy the Project URL and Anon Key

### 2. Admin Credentials

For development/testing, admin login uses environment variables or hardcoded demo credentials:

**Demo Credentials (for testing):**
- Email: `admin@teaminspirecare.com`
- Password: `admin123`

To use custom credentials, set in `.env.local`:
```env
NEXT_PUBLIC_ADMIN_EMAIL=your_admin_email@example.com
NEXT_PUBLIC_ADMIN_PASSWORD=your_admin_password
```

## Database Setup

The database schema has been automatically created with the following tables:

- `users` - Patient and admin profiles
- `departments` - Medical departments
- `doctors` - Doctor information and details
- `services` - Hospital services and procedures
- `appointments` - Patient appointment bookings
- `doctor_availability_slots` - Doctor availability schedule
- `reviews` - Patient reviews and ratings
- `gallery` - Hospital gallery images
- `notifications` - Admin notifications
- `emergency_contacts` - Emergency phone numbers

All tables have Row Level Security (RLS) enabled with appropriate policies for:
- Public read access for doctors, services, departments, gallery
- User-specific access for appointments and profiles
- Admin-only access for management operations

## Feature Overview

### Public Website Features

1. **Navigation Bar**: Hospital branding, quick links, admin login, appointment booking
2. **Hero Section**: Hospital tagline, statistics, specialty list
3. **Services Section**: Dynamic service listing from database
4. **Doctors Section**: Doctor profiles with specialization, experience, consultation fees
5. **Testimonials**: Patient reviews and ratings
6. **Gallery**: Hospital facility images with lightbox
7. **Contact Form**: Patient inquiry submissions
8. **Footer**: Links, contact info, social media

### Admin Dashboard Features

1. **Appointments Manager**
   - View all appointments with status filtering
   - Approve/reject pending appointments
   - Track appointment details

2. **Doctors Manager**
   - Add new doctors with qualifications
   - Set specialization and consultation fees
   - Manage doctor availability

3. **Services Manager**
   - Add hospital services and procedures
   - Set pricing and duration
   - Categorize services

4. **Gallery Manager**
   - Upload and manage hospital images
   - Organize by category
   - Update display order

5. **Settings**: Additional configuration options

## Appointment Booking Flow

1. User clicks "Book Appointment"
2. Opens 3-step modal:
   - **Step 1**: Select doctor
   - **Step 2**: Choose date and time
   - **Step 3**: Enter patient details
3. Appointment is created with "pending" status
4. Admin reviews and approves/rejects
5. Patient receives confirmation

## Admin Login & Dashboard

1. Navigate to `/admin/login`
2. Enter admin credentials
3. Access dashboard for management operations
4. All operations are restricted by RLS policies
5. Session stored in localStorage

## API Routes

The application uses server actions and direct Supabase queries. No additional API routes are needed as Supabase handles authentication and data access.

## Deployment

### Vercel Deployment

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel project settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy

### Custom Domain

In Vercel/Supabase settings, update redirect URLs if using custom domains.

## Development Commands

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linting
pnpm lint
```

## File Structure

```
app/
├── page.tsx                 # Homepage
├── admin/
│   ├── login/page.tsx       # Admin login
│   └── dashboard/page.tsx   # Admin dashboard
├── auth/
│   └── callback/route.ts    # Auth callback handler
└── globals.css              # Global styles with design tokens

components/
├── Navigation.tsx           # Top navigation bar
├── Hero.tsx                 # Hero section
├── Services.tsx             # Services listing
├── Doctors.tsx              # Doctors listing
├── Testimonials.tsx         # Patient testimonials
├── Gallery.tsx              # Gallery with lightbox
├── Contact.tsx              # Contact form
├── Footer.tsx               # Footer
├── AppointmentBooking.tsx   # Appointment modal
└── admin/                   # Admin dashboard components
    ├── AdminSidebar.tsx
    ├── AppointmentsManager.tsx
    ├── DoctorsManager.tsx
    ├── ServicesManager.tsx
    └── GalleryManager.tsx

lib/
└── supabase/               # Supabase configuration
    ├── client.ts           # Browser client
    ├── server.ts           # Server client
    └── proxy.ts            # Middleware proxy
```

## Color Scheme

The application uses a professional hospital color palette:

- **Primary Blue**: #1565c0 - Trust and healthcare
- **Navy**: #0f172a - Professional, authority
- **Emerald Green**: #10b981 - Health, growth
- **Coral Pink**: #f43f5e - Energy, care
- **Gold**: #f59e0b - Premium, trust
- **Gray Neutrals**: For backgrounds and borders

## Security Considerations

1. **RLS Policies**: All data access is controlled through Supabase RLS
2. **Admin Routes**: Protected routes verify authentication
3. **Sensitive Data**: Appointment details are user-scoped
4. **Client Validation**: Form inputs are validated before submission

## Troubleshooting

### "Supabase environment variables not configured"
- Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to `.env.local`
- Restart dev server after adding env vars

### Appointments not showing in admin dashboard
- Verify RLS policy allows admin read access
- Check that admin is marked with `is_admin = true` in auth metadata
- Confirm Supabase connection is active

### Doctors/Services not displaying
- Ensure data is inserted in respective tables
- Verify `is_active = true` for visibility
- Check that services have valid `department_id` if required

## Next Steps

1. **Configure Supabase**: Set up your Supabase project and environment variables
2. **Add Sample Data**: Use admin dashboard to add doctors and services
3. **Customize Branding**: Update hospital name, phone numbers, and contact info
4. **Deploy**: Push to GitHub and deploy to Vercel
5. **Monitor**: Set up error tracking and performance monitoring

## Support

For issues or questions:
- Check Supabase documentation: https://supabase.com/docs
- Next.js docs: https://nextjs.org/docs
- Review RLS policies in Supabase dashboard

---

**Built with**: Next.js 16, Supabase, Tailwind CSS, TypeScript
**Region**: Supabase Mumbai (Asia South)
**Last Updated**: 2026
