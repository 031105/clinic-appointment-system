# Clinic Appointment System

A modern web application built with Next.js and React for managing clinic appointments.

## Project Structure

```
clinic-appointment-system/
├── app/                      # Next.js app directory
│   ├── (auth)/              # Authentication routes
│   │   ├── login/           # Login page
│   │   └── register/        # Registration page
│   ├── (dashboard)/         # Dashboard routes
│   │   ├── admin/           # Admin dashboard
│   │   └── user/            # User dashboard
│   ├── api/                 # API routes
│   │   ├── appointments/    # Appointment endpoints
│   │   ├── doctors/         # Doctor endpoints
│   │   └── users/           # User endpoints
│   └── layout.tsx           # Root layout
├── components/              # Reusable components
│   ├── ui/                  # UI components
│   ├── forms/               # Form components
│   └── layouts/             # Layout components
├── lib/                     # Utility functions
│   ├── db/                  # Database utilities
│   └── utils/               # Helper functions
├── public/                  # Static assets
├── styles/                  # Global styles
├── types/                   # TypeScript types
└── .env.example            # Environment variables example
```

## Database Schema

The project uses the following database structure (see `database.sql` for details):

1. Users and Authentication
2. User Profiles
3. Departments
4. Doctors
5. Doctor Schedules
6. Appointments
7. Patient Medical Records
8. Reviews and Ratings
9. Message Logs

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
```

3. Run the development server:
```bash
npm run dev
```

## Technology Stack

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Prisma (Database ORM)
- NextAuth.js (Authentication)
- React Query (Data Fetching)
- React Hook Form (Form Management)
- Zod (Schema Validation) 