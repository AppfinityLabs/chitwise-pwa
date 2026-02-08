# ChitWise Org Admin PWA

A mobile-first Progressive Web App for Organization Admins to manage chit fund operations.

## Features

- 📱 **Mobile-First PWA** - Install on any device
- 🔐 **Secure Login** - JWT authentication via existing APIs
- 📊 **Dashboard** - Stats, recent activity, pending dues
- 👥 **Members** - Add and manage members
- 📋 **Groups** - Create and manage chit groups
- 💰 **Collections** - Record payments with ease
- 🏆 **Winners** - Track draw results
- 📈 **Reports** - Analytics and insights

## Getting Started

### Prerequisites
- Node.js 18+
- ChitWise backend running on port 3002

### Installation

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your API URL

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | ChitWise backend API URL | `http://localhost:3002` |

## Project Structure

```
src/
├── app/
│   ├── page.tsx            # Dashboard
│   ├── login/              # Login page
│   ├── groups/             # Groups CRUD
│   ├── members/            # Members CRUD
│   ├── collections/        # Collections
│   ├── winners/            # Winners
│   ├── reports/            # Analytics
│   ├── more/               # Settings menu
│   └── settings/           # App settings
├── components/
│   └── BottomNav.tsx       # Mobile navigation
├── context/
│   └── AuthContext.tsx     # Auth state
└── lib/
    └── api.ts              # API client
```

## PWA Installation

1. Open the app in Chrome/Safari
2. Click "Add to Home Screen" or install prompt
3. The app will work offline with cached data

## API Integration

This PWA connects to the existing ChitWise backend APIs:
- `/api/auth/*` - Authentication
- `/api/dashboard` - Dashboard data
- `/api/chitgroups` - Groups management
- `/api/members` - Members management
- `/api/groupmembers` - Subscriptions
- `/api/collections` - Payment recording
- `/api/winners` - Draw results
- `/api/reports` - Analytics

## Tech Stack

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **next-pwa** - PWA support
- **Lucide Icons** - Icons

## License

Private - ChitWise
