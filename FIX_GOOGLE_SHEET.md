# Fix Google Sheet Column Structure

Your Google Sheet has misaligned columns. The "End Date" column appears to be missing, causing all subsequent data to shift left by one column.

## Current Structure (INCORRECT):
```
Event ID | Title | Date | Start Time | End Time | Location | Description | Category | Organizer | Contact Email | Contact Phone | Submitted At | Link
```

## Expected Structure (CORRECT):
```
Event ID | Title | Date | End Date | Start Time | End Time | Location | Description | Category | Organizer | Contact Email | Contact Phone | Submitted At | Link
```

## How to Fix:

### Option 1: Add the Missing Column (Recommended)
1. Open your Google Sheet
2. Right-click on column D (currently "Start Time")
3. Select "Insert 1 left"
4. In the header row, name the new column "End Date"
5. For existing events, copy the Date value to End Date (for single-day events)

### Option 2: Keep Current Structure
The code has been updated to detect and handle your current structure, but this may cause issues with new events added through the form.

## To Prevent Future Issues:

1. Update and redeploy your Google Apps Script (see UPDATE_GOOGLE_SCRIPT.md)
2. Ensure new events are added with all columns in the correct order
3. Consider clearing the sheet and re-adding events through the form to ensure consistency

## Note:
The timestamp appearing in the Contact Email column (column K) is because the data is shifted. Once you add the End Date column, everything should align properly.