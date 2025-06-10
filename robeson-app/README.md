# Robeson County Recovery Resources

A mobile-first, accessible web application for finding recovery and support services in Robeson County, NC.

## Features

- ✅ **Mobile-first design** with large touch targets (min 44px)
- ✅ **One-click actions**: tel: links, mailto:, Google Maps directions
- ✅ **Simple navigation**: Category filtering and search
- ✅ **Crisis services** prominently displayed
- ✅ **Accessibility**: WCAG AA compliant, screen reader friendly
- ✅ **PWA capabilities** for offline use
- ✅ **Simple state management** using React hooks only

## Tech Stack

- Next.js 15.3.3
- TypeScript
- Tailwind CSS
- Progressive Web App (PWA)

## Data Source

The app uses a CSV file (`public/robeson_county.csv`) containing 58 organizations with the following information:
- Organization details (name, address, phone, email, website)
- Service categories and types
- Hours of operation
- Services offered
- Cost/payment information
- Crisis service availability

## Getting Started

### Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

## Deployment

### Option 1: Vercel (Recommended)

1. Push to GitHub
2. Import to Vercel
3. Deploy automatically

### Option 2: Self-hosted

1. Build the app:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

3. For PM2:
   ```bash
   pm2 start npm --name "robeson-recovery" -- start
   ```

### Option 3: Static Export

1. Add to `next.config.ts`:
   ```typescript
   const nextConfig = {
     output: 'export',
   };
   ```

2. Build:
   ```bash
   npm run build
   ```

3. Serve the `out` directory with any static file server.

## Accessibility Features

- High contrast colors
- Large, touch-friendly buttons (min 44px)
- Screen reader announcements
- Keyboard navigation support
- Skip to main content link
- Proper ARIA labels
- Reduced motion support

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome for Android)
- Progressive enhancement for older browsers

## Offline Support

The app includes a service worker that caches:
- Main application shell
- CSV data file
- Static assets

This allows basic functionality even without an internet connection.

## License

This project is open source and available for community use.