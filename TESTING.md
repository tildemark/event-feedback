# 🧪 Testing Guide - Christmas Party Feedback System

## Prerequisites Check

Before testing, ensure you have:
- ✅ Node.js installed (completed - dependencies installed)
- ⚠️ PostgreSQL database running
- ⚠️ `.env` file configured

---

## Step 1: Database Setup

### Option A: Local PostgreSQL (Recommended for Testing)

1. **Install PostgreSQL** (if not already installed):
   - Download from: https://www.postgresql.org/download/windows/
   - Or use Docker: `docker run --name christmas-db -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres`

2. **Create the database**:
   ```powershell
   # Connect to PostgreSQL
   psql -U postgres
   
   # Create database
   CREATE DATABASE christmas_feedback;
   
   # Exit
   \q
   ```

3. **Create `.env` file**:
   ```powershell
   Copy-Item .env.example .env
   ```

4. **Edit `.env`** with your credentials:
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/christmas_feedback?schema=public"
   ```

### Option B: Free Cloud Database (Easiest)

Use a free PostgreSQL database from:
- **Neon** (https://neon.tech) - Free tier, instant setup
- **Supabase** (https://supabase.com) - Free tier
- **Railway** (https://railway.app) - Free trial

Then update `.env` with the connection string they provide.

---

## Step 2: Run Database Migrations

```powershell
# Generate Prisma Client (already done during npm install)
npx prisma generate

# Apply database migrations
npx prisma migrate dev --name init

# (Optional) Open Prisma Studio to view database
npx prisma studio
```

**Expected output**: Table `feedback` created with all columns.

---

## Step 3: Start Development Server

```powershell
npm run dev
```

**Expected output**:
```
- ready started server on 0.0.0.0:3000, url: http://localhost:3000
- event compiled client and server successfully
```

---

## Step 4: Manual Testing Checklist

### Test 1: First-Time User Submission ✅

1. **Open browser**: http://localhost:3000
2. **Check UUID generation**:
   - Open DevTools (F12) → Application → Local Storage
   - Verify `christmas_feedback_user_id` exists with a UUID value
3. **Fill the form**:
   - Rate all 10 categories (click stars)
   - Optionally add name: "Test User"
   - Optionally add department: "QA"
   - Add comment: "This is a test submission"
4. **Submit**:
   - Click "🎁 Submit Feedback"
   - Should see "Thank You!" celebration screen
5. **Verify in database**:
   ```powershell
   npx prisma studio
   ```
   - Open `feedback` table
   - Verify 1 record exists with your ratings

**Expected Result**: ✅ Feedback saved successfully

---

### Test 2: Edit Existing Feedback ✅

1. **Refresh the page** (F5) or click "Edit Feedback"
2. **Verify pre-fill**:
   - All previous ratings should be filled
   - Name, department, and comment should match
   - Button text: "✏️ Update Feedback"
3. **Make changes**:
   - Change some ratings (e.g., Food from 5 to 3)
   - Update comment: "Updated test comment"
4. **Submit update**:
   - Click "✏️ Update Feedback"
   - Should see "Feedback Updated!" message
5. **Verify in database**:
   - Refresh Prisma Studio
   - Should still show 1 record (not 2)
   - `updated_at` timestamp should be newer
   - Ratings should reflect changes

**Expected Result**: ✅ Same record updated, not duplicated

---

### Test 3: Anonymous Submission ✅

1. **Clear localStorage**:
   - DevTools → Application → Local Storage
   - Delete `christmas_feedback_user_id`
2. **Refresh page**:
   - New UUID generated
   - Form is empty
3. **Submit without name/department**:
   - Rate all categories
   - Leave name and department blank
   - Leave comment blank
   - Submit
4. **Verify in database**:
   - Should have 2 records now
   - Second record has `name`, `department`, `comment` as NULL

**Expected Result**: ✅ Anonymous submission works

---

### Test 4: Validation Testing ❌→✅

1. **Refresh page** (or clear localStorage)
2. **Try to submit incomplete form**:
   - Rate only 5 out of 10 categories
   - Try to click submit
3. **Expected behavior**:
   - Submit button disabled (grayed out)
   - Warning message: "⚠️ Please rate all categories before submitting"
4. **Complete the form**:
   - Rate all remaining categories
   - Submit button becomes enabled
   - Submission succeeds

**Expected Result**: ✅ Validation prevents incomplete submissions

---

### Test 5: Mobile Responsiveness 📱

1. **Open DevTools** (F12)
2. **Toggle device toolbar** (Ctrl+Shift+M)
3. **Test different devices**:
   - iPhone SE (375px)
   - iPhone 12 Pro (390px)
   - iPad (768px)
4. **Check**:
   - Stars are touch-friendly (not too small)
   - Form fits screen width
   - No horizontal scrolling
   - Text is readable

**Expected Result**: ✅ Perfect on all screen sizes

---

### Test 6: Multiple Users (Different Browsers) 👥

1. **Open Incognito/Private window**
2. **Submit different feedback**:
   - Different UUID will be generated
   - Different ratings
3. **Verify in database**:
   - Should have multiple records
   - Each with unique `user_id`

**Expected Result**: ✅ Multiple users can submit independently

---

### Test 7: API Endpoint Testing 🔌

#### Test `/api/check` endpoint:

```powershell
# Using PowerShell
$userId = "test-uuid-12345"
$body = @{ user_id = $userId } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3000/api/check" -Method POST -Body $body -ContentType "application/json"
```

**Expected**: `{ "exists": false }`

#### Test `/api/submit` endpoint:

```powershell
$body = @{
    user_id = "test-uuid-12345"
    ratings = @{
        food = 5
        venue = 4
        decor = 5
        photobooth = 3
        giveaways = 4
        emcees = 5
        games = 4
        department_presentations = 5
        raffle = 3
        loyalty_awards = 5
    }
    comment = "API test"
    name = "API Tester"
    department = "QA"
} | ConvertTo-Json -Depth 3

Invoke-RestMethod -Uri "http://localhost:3000/api/submit" -Method POST -Body $body -ContentType "application/json"
```

**Expected**: `{ "success": true, "message": "Feedback submitted successfully" }`

---

## Step 5: Database Verification

### View all feedback:
```powershell
npx prisma studio
```

### Or use SQL queries:
```sql
-- Count total submissions
SELECT COUNT(*) FROM feedback;

-- View all submissions
SELECT id, user_id, name, department, food, venue, created_at 
FROM feedback 
ORDER BY created_at DESC;

-- Calculate average ratings
SELECT 
  AVG(food) as avg_food,
  AVG(venue) as avg_venue,
  AVG(decor) as avg_decor,
  AVG(photobooth) as avg_photobooth
FROM feedback;

-- Find submissions with comments
SELECT name, department, comment 
FROM feedback 
WHERE comment IS NOT NULL;
```

---

## Common Issues & Fixes

### ❌ "Can't reach database server"
**Fix**: 
```powershell
# Check PostgreSQL is running
Get-Service -Name postgresql*

# Start service if stopped
Start-Service postgresql-x64-14
```

### ❌ "Database does not exist"
**Fix**:
```sql
-- Connect to PostgreSQL
psql -U postgres

-- Create database
CREATE DATABASE christmas_feedback;
```

### ❌ Module not found errors
**Fix**:
```powershell
rm -r node_modules
rm package-lock.json
npm install
```

### ❌ Port 3000 already in use
**Fix**:
```powershell
# Kill process on port 3000
$process = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($process) { Stop-Process -Id $process.OwningProcess -Force }

# Or use different port
$env:PORT=3001; npm run dev
```

---

## Performance Testing

### Test with multiple rapid submissions:
```powershell
# PowerShell script to submit 10 feedbacks quickly
1..10 | ForEach-Object {
    $body = @{
        user_id = "perf-test-$_"
        ratings = @{
            food = Get-Random -Minimum 1 -Maximum 6
            venue = Get-Random -Minimum 1 -Maximum 6
            decor = Get-Random -Minimum 1 -Maximum 6
            photobooth = Get-Random -Minimum 1 -Maximum 6
            giveaways = Get-Random -Minimum 1 -Maximum 6
            emcees = Get-Random -Minimum 1 -Maximum 6
            games = Get-Random -Minimum 1 -Maximum 6
            department_presentations = Get-Random -Minimum 1 -Maximum 6
            raffle = Get-Random -Minimum 1 -Maximum 6
            loyalty_awards = Get-Random -Minimum 1 -Maximum 6
        }
        comment = "Performance test $_"
    } | ConvertTo-Json -Depth 3
    
    Invoke-RestMethod -Uri "http://localhost:3000/api/submit" -Method POST -Body $body -ContentType "application/json"
    Write-Host "Submitted feedback $_"
}
```

---

## Test Summary Checklist

- [ ] Dependencies installed (`npm install`)
- [ ] Database created and running
- [ ] `.env` file configured
- [ ] Migrations applied (`npx prisma migrate dev`)
- [ ] Dev server running (`npm run dev`)
- [ ] First submission works
- [ ] Update/edit works (UPSERT)
- [ ] Pre-fill works on page refresh
- [ ] Anonymous submission works
- [ ] Form validation works
- [ ] Mobile responsive design verified
- [ ] Multiple users can submit
- [ ] Database shows correct data
- [ ] No duplicate entries for same UUID

---

## Next Steps

Once all tests pass:

1. **Reset database** for production:
   ```powershell
   npx prisma migrate reset
   ```

2. **Build for production**:
   ```powershell
   npm run build
   npm start
   ```

3. **Deploy** to your hosting platform

---

## Quick Test Script

Save this as `test.ps1` for quick testing:

```powershell
# Quick Test Script
Write-Host "🧪 Running Quick Tests..." -ForegroundColor Cyan

# Test 1: Server Running
Write-Host "`n1. Testing server..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing
    Write-Host "✅ Server is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Server not running. Run: npm run dev" -ForegroundColor Red
}

# Test 2: API Check endpoint
Write-Host "`n2. Testing /api/check..." -ForegroundColor Yellow
try {
    $body = @{ user_id = "test-123" } | ConvertTo-Json
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/check" -Method POST -Body $body -ContentType "application/json"
    Write-Host "✅ Check API works: $($response | ConvertTo-Json)" -ForegroundColor Green
} catch {
    Write-Host "❌ Check API failed: $_" -ForegroundColor Red
}

Write-Host "`n🎄 Test complete!" -ForegroundColor Cyan
```

Run with: `.\test.ps1`

---

🎄 **Happy Testing!** 🎄
