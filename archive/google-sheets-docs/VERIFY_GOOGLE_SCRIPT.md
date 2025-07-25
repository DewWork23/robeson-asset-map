# Verify Google Apps Script Setup

## Check Your Current Script

1. Go to script.google.com
2. Open your Events script
3. Verify the `addEvent` function includes this line for Event ID:

```javascript
eventsSheet.appendRow([
  data.id || Date.now().toString(),  // <-- This should be FIRST
  data.title,
  data.date,
  data.endDate || data.date,  // <-- This should use endDate from data
  // ... rest of fields
```

## Test the Script Directly

You can test if the script is working by:

1. In the Apps Script editor, add this test function:

```javascript
function testAddEvent() {
  const testData = {
    id: 'TEST_' + Date.now(),
    title: 'Test Event Direct',
    date: '2025-07-26',
    endDate: '2025-07-26',
    startTime: '2:00 PM',
    endTime: '3:00 PM',
    location: 'Test Location',
    description: 'Test Description',
    category: 'Test',
    organizer: 'Test Organizer',
    contactEmail: 'test@example.com',
    contactPhone: '123-456-7890',
    link: 'https://example.com'
  };
  
  const result = addEvent(testData);
  console.log(result);
}
```

2. Run `testAddEvent` and check if it adds a row with Event ID properly filled

## Manual Fix for Existing Events

To fix your existing events without IDs:

1. In your Google Sheet, for each event without an ID in column A:
   - Add a unique ID like `EVENT_1`, `EVENT_2`, etc.
   - Or use `=ROW()&"_"&B2` formula (row number + title)

2. Make sure End Date (column D) is filled for all events

## Redeploy Checklist

- [ ] Updated script code from `google-apps-script.js`
- [ ] Saved the script
- [ ] Created new deployment
- [ ] Updated NEXT_PUBLIC_GOOGLE_SCRIPT_URL with new URL
- [ ] Restarted Next.js development server
- [ ] Cleared browser cache

## Debug in Browser Console

Open the browser console on your events page and look for:
- "Event has no ID" warnings
- "Sending to Google Sheets:" logs
- Any error messages