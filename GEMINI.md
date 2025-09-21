# Project Overview: MVP Salon App

This directory contains the complete planning and specification documents for a low-friction, mobile-first web application designed for a salon. The application's purpose is to allow service providers to quickly digitize handwritten forms by taking a photo, which is then automatically processed and stored.

The core design philosophy is to minimize "cognitive friction" by creating a simple, single-purpose tool that integrates seamlessly into the user's existing workflow.

## Technology Stack

The project is defined by a lightweight, serverless architecture:

*   **Frontend**: Vanilla HTML, CSS, and JavaScript (ES6+). No frameworks are to be used to ensure maximum performance on low-spec mobile devices.
*   **Backend**: An [n8n.io](https://n8n.io/) workflow triggered by a webhook.
*   **OCR Processing**: Google Cloud Vision API for text transcription from images.
*   **Storage**: Google Drive for storing the uploaded images.
*   **Hosting**: A static hosting provider like Vercel or Netlify.

## Key Files

This directory is for project planning and documentation. The key artifacts are:

*   `01 MVP App Salom - Project Brief.md`: Outlines the core problem, proposed solution, target users, and high-level vision.
*   `02 MVP App Salon - Product Requirements Document (PRD).md`: Details the functional/non-functional requirements, epics, and user stories for the MVP.
*   `03 MVP App Salon - UIUX Specification.md`: Defines the user experience, information architecture, user flows, and visual design, based on a simple prototype.
*   `04 MVP App Salon - Frontend Architecture Document.md`: Provides the technical blueprint for the frontend, including project structure, state management, and testing strategy.

## Development Plan

The provided documents lay out a clear path to development. The next steps are to begin implementation based on the user stories in the PRD.

### Proposed Project Structure:

```
project-root/
├── public/
│   ├── index.html       # The main application screen
│   ├── styles.css       # CSS for styling
│   └── script.js        # Client-side application logic
├── tests/
│   ├── script.test.js   # Unit tests (Jest)
│   └── e2e/
│       └── upload.spec.js # E2E tests (Playwright)
├── .gitignore
└── README.md
```
