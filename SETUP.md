# Christmas Party Feedback System - Quick Setup Guide

## 🎄 Welcome!

This guide will help you set up and run the Christmas Party Feedback System.

## Prerequisites Checklist

- [ ] Node.js 18 or higher installed
- [ ] PostgreSQL database running (local or remote)
- [ ] npm or yarn package manager

## Step-by-Step Setup

### 1. Install Dependencies

Open your terminal in the project directory and run:

```bash
npm install
```

This will install all required packages including Next.js, Prisma, TypeScript, and Tailwind CSS.

### 2. Configure Database Connection

Create a `.env` file in the root directory (copy from `.env.example`):

```bash
# Windows PowerShell
Copy-Item .env.example .env
```

Then edit `.env` and update the `DATABASE_URL` with your PostgreSQL credentials:

```env
DATABASE_URL="postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/christmas_feedback?schema=public"
```

**Example**:
```env
DATABASE_URL="postgresql://postgres:mypassword@localhost:5432/christmas_feedback?schema=public"
```

### 3. Create and Migrate Database

Run these commands to set up your database:

```bash
# Generate Prisma Client
npx prisma generate

# Run database migrations (creates the feedback table)
npx prisma migrate dev --name init

# Optional: Open Prisma Studio to view your database
npx prisma studio
```

### 4. Start Development Server

```bash
npm run dev
```

The application will be available at: **http://localhost:3000**

### 5. Test the Application

1. Open http://localhost:3000 in your browser
2. Fill out the feedback form with ratings
3. Optionally add your name and department
4. Submit the form
5. Refresh the page - you should see your previous responses loaded
6. Try updating your feedback

## Common Issues & Solutions

### Issue: "Can't reach database server"

**Solution**: Make sure PostgreSQL is running and the DATABASE_URL is correct.

```bash
# Check if PostgreSQL is running (Windows)
Get-Service -Name postgresql*

# Start PostgreSQL service if needed
Start-Service postgresql-x64-XX
```

### Issue: "Error: P1001: Can't reach database server"

**Solution**: Check your database credentials and ensure the database exists.

```sql
-- Connect to PostgreSQL and create database
CREATE DATABASE christmas_feedback;
```

### Issue: Module not found errors

**Solution**: Run `npm install` again and ensure all dependencies are installed.

### Issue: Prisma Client not generated

**Solution**: Run `npx prisma generate` manually.

## Database Management

### View Database in GUI
```bash
npx prisma studio
```

### Reset Database (Development Only)
```bash
npx prisma migrate reset
```

### Create New Migration
```bash
npx prisma migrate dev --name your_migration_name
```

## Project Structure

```
feedback/
├── app/
│   ├── api/
│   │   ├── check/route.ts      # Check existing feedback API
│   │   └── submit/route.ts     # Submit/Update feedback API
│   ├── globals.css             # Global styles
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Main feedback form
├── components/
│   └── StarRating.tsx          # Star rating component
├── lib/
│   ├── prisma.ts               # Prisma client singleton
│   ├── types.ts                # TypeScript types
│   └── userId.ts               # UUID management
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── migrations/             # Database migrations
├── .env                        # Environment variables (you create this)
├── .env.example                # Example environment file
├── package.json                # Project dependencies
├── tailwind.config.ts          # Tailwind configuration
└── tsconfig.json               # TypeScript configuration
```

## Features Overview

✅ **UUID-based User Identification**: Automatic, stored in localStorage
✅ **UPSERT Logic**: Submit new or update existing feedback seamlessly
✅ **Anonymous or Identified**: Name and department are optional
✅ **10 Rating Categories**: All required (1-5 stars)
✅ **Mobile-Optimized**: Perfect for phone submissions
✅ **Christmas Theme**: Festive red, green, and gold colors

## Production Deployment

When ready to deploy:

1. Set `DATABASE_URL` environment variable on your hosting platform
2. Run `npx prisma migrate deploy` to apply migrations
3. Run `npm run build` to build the application
4. Start with `npm start`

### Recommended Hosting Platforms

- **Vercel**: Best for Next.js (automatic deployments)
- **Railway**: Easy PostgreSQL + Next.js hosting
- **Render**: Free tier available for testing
- **AWS/Azure/GCP**: For enterprise deployments

## Support

For issues or questions:
1. Check the README.md for detailed documentation
2. Review Prisma documentation: https://www.prisma.io/docs
3. Review Next.js documentation: https://nextjs.org/docs

---

🎄 **Enjoy your Christmas Party Feedback System!** 🎄
