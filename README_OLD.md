# Christmas Party Feedback System

A festive, mobile-first feedback application built with Next.js 14, PostgreSQL, and Prisma.

## Features

- ✨ **Anonymous & Identified Feedback**: Users can choose to remain anonymous or provide their name/department
- 🔄 **Edit Capability**: Users can update their feedback anytime using their unique UUID
- ⭐ **Star Rating System**: 5-star rating for 10 different categories
- 🎄 **Christmas Theme**: Festive design with red, green, and gold colors
- 📱 **Mobile-First**: Fully responsive design optimized for mobile devices
- 🔒 **Duplicate Prevention**: Each user (identified by UUID) can only submit once, but can edit
- 💾 **UPSERT Logic**: Backend automatically handles insert or update based on user_id

## Rating Categories

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

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL
- **ORM**: Prisma
- **UUID**: uuid package for unique user identification

## Getting Started

### Prerequisites

- Node.js 18+ installed
- PostgreSQL database running
- npm or yarn package manager

### Installation

1. **Clone and install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/christmas_feedback?schema=public"
   ```

3. **Set up the database**:
   ```bash
   npx prisma migrate dev --name init
   npx prisma generate
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Open the application**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Database Schema

The `Feedback` table includes:

- `id`: Auto-incrementing primary key
- `user_id`: Unique UUID for each user (stored in localStorage)
- `created_at`: Timestamp of first submission
- `updated_at`: Timestamp of last update
- Rating fields (1-5 for each category):
  - `food`, `venue`, `decor`, `photobooth`, `giveaways`
  - `emcees`, `games`, `department_presentations`, `raffle`, `loyalty_awards`
- `comment`: Optional text feedback
- `name`: Optional user name/alias
- `department`: Optional department
- `user_agent`: Browser user agent string

## API Routes

### POST `/api/check`
Check if a user has already submitted feedback.

**Request**:
```json
{
  "user_id": "uuid-string"
}
```

**Response**:
```json
{
  "exists": true,
  "feedback": {
    "ratings": { ... },
    "comment": "...",
    "name": "...",
    "department": "..."
  }
}
```

### POST `/api/submit`
Submit or update feedback (UPSERT operation).

**Request**:
```json
{
  "user_id": "uuid-string",
  "ratings": {
    "food": 5,
    "venue": 4,
    ...
  },
  "comment": "Optional comment",
  "name": "Optional name",
  "department": "Optional department"
}
```

**Response**:
```json
{
  "success": true,
  "isUpdate": false,
  "message": "Feedback submitted successfully"
}
```

## User Flow

1. **First Visit**: 
   - System generates and stores a UUID in localStorage
   - User sees empty form
   - Submit button shows "Submit Feedback"

2. **Returning User**:
   - System retrieves UUID from localStorage
   - Checks for existing feedback via `/api/check`
   - Pre-fills form with previous responses
   - Submit button shows "Update Feedback"

3. **Submission**:
   - Validates all ratings are filled (1-5)
   - Sends data to `/api/submit`
   - Backend performs UPSERT operation
   - Shows success/celebration screen

## Validation Rules

- All 10 rating categories are **required** (must be 1-5)
- Name and Department are **optional**
- Comment is **optional**
- UUID is automatically handled and required for all operations

## Mobile Optimization

- Touch-friendly star rating buttons (larger tap targets)
- Responsive grid layouts
- Optimized font sizes for mobile screens
- Full-width form on mobile, centered on desktop
- Smooth animations and transitions

## Production Deployment

1. **Set production environment variables** on your hosting platform
2. **Run database migrations**:
   ```bash
   npx prisma migrate deploy
   ```
3. **Build the application**:
   ```bash
   npm run build
   ```
4. **Start the production server**:
   ```bash
   npm start
   ```

## Prisma Commands

```bash
# Create a new migration
npx prisma migrate dev --name migration_name

# Apply migrations in production
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate

# Open Prisma Studio (database GUI)
npx prisma studio

# Reset database (dev only)
npx prisma migrate reset
```

## Customization

### Changing Colors
Edit `tailwind.config.ts` to modify the Christmas theme colors:
```typescript
colors: {
  christmas: {
    red: { ... },
    green: { ... },
    gold: { ... },
  },
}
```

### Adding Categories
1. Update `schema.prisma` with new rating field
2. Add to `ratingCategories` in `lib/types.ts`
3. Run `npx prisma migrate dev`

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

This project is created for internal company use.

---

🎄 **Happy Holidays!** 🎄
