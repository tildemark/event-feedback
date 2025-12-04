# 🎄 Christmas Party Feedback System

A beautiful, festive feedback collection system for annual Christmas party events. Built with Next.js 14, PostgreSQL, and modern UI components.

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue)
![Docker](https://img.shields.io/badge/Docker-Ready-blue)

## ✨ Features

- 🎅 **Festive Christmas Theme** - Beautiful red, green, and gold design
- 📱 **Mobile-First** - Optimized for phone and tablet submissions
- 🔄 **Edit Capability** - Users can update their feedback anytime
- 🎭 **Anonymous or Identified** - Optional name and department fields
- ⭐ **10 Rating Categories** - Comprehensive event feedback
- 💾 **Smart UPSERT** - No duplicate submissions
- 🔒 **UUID Tracking** - Privacy-friendly user identification
- 📊 **Admin Report** - Beautiful analytics dashboard with CSV/JSON export
- 🐳 **Docker Ready** - Easy deployment with Docker Compose

## 🎯 Rating Categories

1. Food
2. Venue
3. Decor
4. Photobooth
5. Giveaways
6. Emcees
7. Games
8. Department Presentations
9. Raffle
10. Loyalty Awards

## 🚀 Quick Start

### Development

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your database URL

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Production Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed production deployment instructions.

**Quick Deploy with Docker:**

```bash
# Copy and configure environment
cp .env.production.example .env.production
# Edit .env.production with your settings

# Start with Docker Compose
docker-compose -f docker-compose.prod.yml up -d
```

## 📋 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL 16
- **ORM**: Prisma
- **Styling**: Tailwind CSS
- **Container**: Docker & Docker Compose
- **Deployment**: Portainer + Nginx Proxy Manager

## 🗄️ Database Schema

```prisma
model Feedback {
  id                       Int      @id @default(autoincrement())
  user_id                  String   @unique
  created_at               DateTime @default(now())
  updated_at               DateTime @updatedAt
  
  // Rating fields (1-5)
  food                     Int
  venue                    Int
  decor                    Int
  photobooth              Int
  giveaways               Int
  emcees                  Int
  games                   Int
  department_presentations Int
  raffle                  Int
  loyalty_awards          Int
  
  // Optional fields
  comment                 String?
  name                    String?
  department              String?
  user_agent              String?
}
```

## 📁 Project Structure

```
feedback/
├── app/
│   ├── api/
│   │   ├── check/route.ts       # Check existing feedback
│   │   └── submit/route.ts      # Submit/Update feedback
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                 # Main feedback form
├── components/
│   └── StarRating.tsx           # Star rating component
├── lib/
│   ├── prisma.ts                # Database client
│   ├── types.ts                 # TypeScript types
│   └── userId.ts                # UUID management
├── prisma/
│   ├── schema.prisma            # Database schema
│   └── migrations/              # Database migrations
├── docker-compose.prod.yml      # Production deployment
├── Dockerfile                   # Container build
└── DEPLOYMENT.md                # Deployment guide
```

## 🔧 Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/dbname?schema=public"

# Production
NODE_ENV=production
PORT=3000
HOSTNAME=0.0.0.0
```

## 📖 Documentation

- [Setup Guide](./SETUP.md) - Detailed setup instructions
- [Testing Guide](./TESTING.md) - How to test the application
- [Deployment Guide](./DEPLOYMENT.md) - Production deployment
- [Project Summary](./PROJECT_SUMMARY.md) - Complete overview

## 🎮 Usage

### For Employees

1. Visit the feedback URL
2. Rate all 10 categories (1-5 stars)
3. Optionally provide name and department
4. Add comments if desired
5. Submit feedback
6. Can return later to edit responses

### For Administrators

Access the report dashboard:
```
http://your-domain.com/report
```

Features:
- View summary statistics
- See average ratings with visual charts
- Export to CSV for Excel analysis
- Export to JSON for data processing
- Print-friendly formatted reports

```bash
# Or view all feedback in database GUI
npx prisma studio

# Export data via command line
docker exec christmas-feedback-db pg_dump -U postgres christmas_feedback > backup.sql
```

See [ADMIN_REPORT.md](./ADMIN_REPORT.md) for detailed admin guide.

## 🔒 Security

- UUID-based user tracking (privacy-friendly)
- Environment variables for sensitive data
- SQL injection protection via Prisma
- Input validation on frontend and backend
- Optional SSL via Nginx Proxy Manager

## 📊 Features in Detail

### UUID User Identification
- Automatic UUID generation on first visit
- Stored in browser localStorage
- Enables editing without login
- Privacy-friendly tracking

### UPSERT Logic
- Checks for existing feedback on page load
- Pre-fills form with previous responses
- Submit button changes to "Update Feedback"
- No duplicate entries in database

### Mobile Optimization
- Touch-friendly star ratings
- Responsive design
- Optimized for small screens
- Fast loading

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📝 License

This project is for internal company use.

## 🎄 Support

For issues or questions, please open an issue in the GitHub repository.

---

**Made with ❤️ for the Annual Christmas Party**

🎅 **Happy Holidays!** 🎄
