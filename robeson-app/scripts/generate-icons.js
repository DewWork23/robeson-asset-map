const fs = require('fs');
const path = require('path');

// Create a simple SVG icon
const svgContent = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#1e40af"/>
  <circle cx="256" cy="180" r="80" fill="white"/>
  <path d="M256 280 L156 420 L356 420 Z" fill="white"/>
  <text x="256" y="480" font-family="Arial" font-size="40" fill="white" text-anchor="middle">RECOVERY</text>
</svg>
`;

// Save SVG
fs.writeFileSync(path.join(__dirname, '../public/icon.svg'), svgContent);

console.log('Icon created successfully!');