# Archive Directory

This directory contains files that are no longer actively used in the project but are kept for historical reference.

## Contents

### `/sql-imports/`
Old SQL import scripts from various attempts to import CSV data:
- `import-organizations-alternative.sql` - Alternative import method
- `import-organizations-correct.sql` - Import for "Organization Name" CSV format
- `import-organizations-direct.sql` - Direct import approach
- `import-organizations-step1-fixed.sql` - Fixed version for case-sensitive columns
- `import-organizations-step2-fixed.sql` - Fixed transfer script
- `import-organizations-transfer.sql` - Transfer script for "Organization Name" format

**Active versions kept in main directory:**
- `import-organizations-step1.sql` - Working import script for "Agency" format
- `import-organizations-step2.sql` - Working transfer script

### `/old-data/`
- `consolidated_robeson.csv` - Old CSV without coordinates
- `consolidated_robeson_migrated.csv` - Migrated version
- `corrected_categories.csv` - Category correction data
- `page.backup.tsx` - Backup of events page

### `/scripts/`
- `normalize_categories.py` - One-time script for category normalization

### `/docs/`
- `category_correction_summary.md` - Summary of category corrections

### `/old-static-site/`
- Contains the old static site build files from the `out` directory

## Parent Directory Archives (`../archive/`)

### `/old-csv/`
- Old CSV files without coordinates

### `/google-sheets-docs/`
- Google Sheets integration documentation (now using Supabase)
- Google Apps Script files

### `/screenshots/`
- Old screenshots from development

### `/sql-imports/`
- Initial import SQL scripts

## Note
These files are archived because the project has migrated from Google Sheets to Supabase for data storage. The current application uses Supabase for both events and organizations data.