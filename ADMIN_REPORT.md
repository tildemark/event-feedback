# 📊 Admin Report Access Guide

## Accessing the Feedback Report

The feedback report is available at:

```
http://your-domain.com/report
```

Or locally:
```
http://localhost:3000/report
```

### Report Features

1. **Summary Statistics**
   - Total number of responses
   - Number of responses with comments
   - Number of identified respondents
   - Number of unique departments

2. **Average Ratings**
   - Visual bar charts for all 10 categories
   - Ratings displayed as X.XX / 5
   - Color-coded progress bars

3. **Individual Responses**
   - Complete list of all feedback
   - Name, department, timestamps
   - All ratings for each category
   - Comments (if provided)

4. **Export Options**
   - **CSV Export** - Opens in Excel/Google Sheets
   - **JSON Export** - Raw data for further analysis
   - **Print** - Print-friendly formatted report

---

## Export Formats

### CSV Export
Perfect for Excel analysis, includes:
- ID, Timestamp, Name, Department
- All 10 rating categories
- Comments

**Filename**: `christmas-party-feedback-YYYY-MM-DD.csv`

### JSON Export
Complete data export including:
- Statistics summary
- All responses with full details
- Structured format for data analysis

**Filename**: `christmas-party-feedback-YYYY-MM-DD.json`

---

## Security Recommendations

### Option 1: Password Protection (Simple)

Add basic authentication to the report page:

1. Install package:
```bash
npm install next-auth
```

2. Configure simple password in environment:
```env
ADMIN_PASSWORD=YourSecurePassword123
```

3. Add middleware to protect `/report` route

### Option 2: IP Restriction

Configure Nginx/NPM to restrict `/report` to specific IPs:

```nginx
location /report {
    allow 10.10.0.0/24;     # Internal network
    allow 112.198.194.104;  # Server IP
    deny all;
    proxy_pass http://10.10.0.3:3001;
}
```

### Option 3: Remove Public Access

If you only want database access, use Prisma Studio:

```bash
# On production server
docker exec -it christmas-feedback-app npx prisma studio
```

Then access via SSH tunnel:
```bash
ssh -L 5555:localhost:5555 user@112.198.194.104
```

Open: http://localhost:5555

---

## Sharing with Committee

### Method 1: PDF Export
1. Open `/report` page
2. Click "Print" button
3. Choose "Save as PDF" in print dialog
4. Share PDF file with committee

### Method 2: CSV for Analysis
1. Click "Export CSV"
2. Open in Excel/Google Sheets
3. Create charts and pivot tables
4. Share spreadsheet with committee

### Method 3: Scheduled Reports

Create a cron job to export reports automatically:

```bash
# Add to crontab on production server
0 9 * * * docker exec christmas-feedback-app node /app/scripts/export-report.js
```

---

## Data Analysis Tips

### In Excel/Google Sheets:

1. **Average Ratings**:
   ```
   =AVERAGE(E2:E100)  // For Food column
   ```

2. **Satisfaction Score**:
   ```
   =(AVERAGE(E2:N100)/5)*100  // Overall % satisfaction
   ```

3. **Response Rate by Department**:
   - Use COUNTIF to count responses per department
   - Create pie chart

4. **Top/Bottom Rated Categories**:
   - Sort by average rating
   - Identify areas for improvement

### Common Queries:

**Most common rating for each category:**
```sql
SELECT 
  MODE() WITHIN GROUP (ORDER BY food) as most_common_food_rating,
  MODE() WITHIN GROUP (ORDER BY venue) as most_common_venue_rating
FROM feedback;
```

**Comments with low ratings:**
```sql
SELECT name, department, comment, 
       (food + venue + decor + photobooth + giveaways + emcees + games + 
        department_presentations + raffle + loyalty_awards) / 10 as avg_rating
FROM feedback
WHERE comment IS NOT NULL
  AND (food + venue + decor + photobooth + giveaways + emcees + games + 
       department_presentations + raffle + loyalty_awards) / 10 < 3
ORDER BY avg_rating ASC;
```

---

## Report Page URLs

- **Production**: `https://your-domain.com/report`
- **Local Development**: `http://localhost:3000/report`
- **Internal**: `http://10.10.0.3:YOUR_PORT/report`

---

## Sample Committee Report Template

```markdown
# Christmas Party 2025 - Feedback Summary

**Total Responses**: XX
**Response Rate**: XX%
**Overall Satisfaction**: X.XX / 5

## Top Rated Categories
1. Category Name - X.XX / 5
2. Category Name - X.XX / 5
3. Category Name - X.XX / 5

## Areas for Improvement
1. Category Name - X.XX / 5
2. Category Name - X.XX / 5

## Key Highlights from Comments
- "Quote from positive feedback"
- "Suggestion for next year"

## Recommendations for 2026
1. Maintain excellence in top-rated areas
2. Address concerns in lower-rated categories
3. Implement suggestions from feedback

**Full detailed report attached as PDF/CSV**
```

---

🎄 **Report is ready to share with committee members!** 🎄
