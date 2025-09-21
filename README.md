# MVP Salon App

A low-friction digital workflow tool designed for salon staff to upload photos of handwritten forms for automatic transcription using Google Vision OCR.

## Features

- 📱 Mobile-first responsive design
- 📸 Camera integration for photo capture
- 🔄 Automatic retry logic with exponential backoff
- ✅ File validation (type, size)
- 🌐 Real-time status updates
- 🔒 Secure file handling
- 📋 OCR text extraction via Google Vision API
- 💾 Google Drive storage integration

## Tech Stack

- **Frontend**: Vanilla HTML, CSS, JavaScript
- **Backend**: n8n workflow automation
- **OCR**: Google Vision API
- **Storage**: Google Drive
- **Testing**: Jest (unit tests), Playwright (E2E tests)
- **Deployment**: Vercel/Netlify compatible

## Quick Start

### Prerequisites

- Node.js 18+ (for development and testing)
- n8n instance with webhook access
- Google Cloud project with Vision API enabled
- Google Drive with API access

### Development Setup

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:3000`

3. **Run tests:**
   ```bash
   # Unit tests
   npm test

   # E2E tests (requires dev server running)
   npm run test:e2e

   # All tests
   npm run test:all
   ```

### Configuration

Update the webhook URL in `public/script.js`:

```javascript
const WEBHOOK_URL = 'YOUR_N8N_WEBHOOK_URL_HERE';
```

### n8n Workflow Setup

1. Import the workflow from `MVP App Salon.json` into your n8n instance
2. Configure Google credentials:
   - Google Drive OAuth2 API
   - Google Gemini (PaLM) API
3. Set the correct Google Drive folder ID in the workflow
4. Activate the workflow

## Deployment

### Vercel

1. Connect your GitHub repository to Vercel
2. Deploy automatically on push to main branch
3. Set environment variables if needed

### Netlify

1. Connect your GitHub repository to Netlify
2. Set build command: `echo 'Static site'`
3. Set publish directory: `public`
4. Deploy automatically on push to main branch

## Project Structure

```
project-root/
├── public/               # Static frontend files
│   ├── index.html       # Main HTML file
│   ├── styles.css       # CSS styles
│   └── script.js        # JavaScript logic
├── tests/               # Test files
│   ├── script.test.js   # Unit tests
│   └── e2e/            # E2E tests
│       └── upload.spec.js
├── MVP App Salon.json   # n8n workflow configuration
├── package.json         # Dependencies and scripts
├── vercel.json         # Vercel deployment config
├── netlify.toml        # Netlify deployment config
└── README.md           # This file
```

## User Flow

1. User selects their name from dropdown
2. User taps "Take Photo" button
3. Device camera opens for photo capture
4. Photo is validated (size, type)
5. Image uploads to n8n webhook
6. n8n workflow:
   - Validates image type
   - Uploads to Google Drive
   - Extracts text using Google Vision API
   - Returns success response
7. User sees success confirmation

## Error Handling

- **File validation**: Size and type checking
- **Network retries**: Exponential backoff up to 3 attempts
- **Timeout handling**: 30-second request timeout
- **User feedback**: Clear status messages for all states

## Security Features

- Content Security Policy headers
- XSS protection
- File type validation
- Size limits (10MB max)
- HTTPS-only cookie settings (when applicable)

## Browser Support

- Modern mobile browsers (iOS Safari, Chrome Mobile)
- Desktop browsers (Chrome, Firefox, Safari, Edge)
- Camera API support required for photo capture

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm run test:all`
5. Submit a pull request

## License

MIT License - see LICENSE file for details
