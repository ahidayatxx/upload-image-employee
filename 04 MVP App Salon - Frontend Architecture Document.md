# **Low-Friction Digital Workflow Tool Frontend Architecture Document**

### **Template and Framework Selection**

Based on the PRD, we are proceeding with a custom "from scratch" approach rather than using a starter template. This aligns perfectly with the core requirement of creating a minimal, dependency-free, and highly performant application. All tooling and configuration will be set up manually as defined in this document.

#### **Change Log**

| Date | Version | Description | Author |
| :---- | :---- | :---- | :---- |
| 2025-09-18 | 1.0 | Initial Frontend Architecture Draft | Winston (Architect) |

---

## **Frontend Tech Stack**

| Category | Technology | Version | Purpose | Rationale |
| :---- | :---- | :---- | :---- | :---- |
| **Framework** | None (Vanilla JS) | ES6+ | Core application logic | Aligns with the no-framework requirement for maximum performance and minimal overhead. |
| **Styling** | Standard CSS | CSS3 | Visual styling | No pre-processors or libraries needed, keeping the project simple and fast. |
| **Unit Testing** | Jest | Latest | JavaScript testing | A popular, powerful, and easy-to-set-up framework for testing our client-side logic. |
| **E2E Testing** | Playwright | Latest | End-to-end validation | A modern tool for automating browser tests to ensure the full user flow works reliably. |

---

## **Project Structure**

Plaintext

project-root/  
├── public/  
│   ├── index.html       \# The main HTML file (from html.txt)  
│   ├── styles.css       \# The CSS styles (extracted from html.txt)  
│   └── script.js        \# The JavaScript logic (extracted from html.txt)  
├── tests/  
│   ├── script.test.js   \# Unit tests for our JavaScript logic  
│   └── e2e/  
│       └── upload.spec.js \# E2E test for the upload flow  
├── .gitignore           \# To ignore development files (e.g., node\_modules)  
└── README.md            \# Project overview and setup instructions

---

## **Component Standards**

* Component Template  
  We will adopt a simple, function-based component pattern. Each component will be a JavaScript function that is responsible for creating, updating, and returning its corresponding DOM element.  
* **Naming Conventions**  
  * **JavaScript Files:** kebab-case.js  
  * **CSS Classes:** kebab-case (using BEM)  
  * **JS Functions:** camelCase

---

## **State Management**

We will use a single, top-level JavaScript object to hold the application's state, managed by a setState function that triggers a render function to keep the UI in sync with the data.

---

## **API Integration**

* API Service Function  
  A single, asynchronous submitForm function using the fetch API will handle all communication with the backend n8n webhook.  
* **API Client Configuration**  
  * **Endpoint:** A single n8n webhook URL will be stored as a constant in script.js.  
  * **Payload Structure:**  
    JSON  
    {  
      "employeeName": "string",  
      "imageData": "string (base64 encoded)"  
    }

---

## **Routing**

This is a **single-page application (SPA)** that does not require a routing library or multiple routes. All functionality is contained within index.html.

---

## **Styling Guidelines**

* **Methodology:** Standard CSS in public/styles.css using the BEM naming convention.  
* **Global Theme Variables:** Core colors, fonts, and spacing will be defined as CSS Custom Properties in a :root selector for easy maintenance.

---

## **Testing Requirements**

* **Component Test Template:** Unit tests will be created with Jest to validate DOM updates and function logic.  
* **Testing Best Practices:**  
  * Use Unit Tests for individual functions and E2E tests (Playwright) for the full user flow.  
  * Aim for 80% code coverage.  
  * Mock the fetch call to the n8n webhook in tests.

---

## **Environment Configuration**

The application will require one primary environment variable in script.js:

* WEBHOOK\_URL: The full URL for the n8n webhook that receives the form submission.

---

## **Frontend Developer Standards**

* **Critical Coding Rules:**  
  * **Separate Concerns:** Keep logic (JS), structure (HTML), and presentation (CSS) in their dedicated files.  
  * **State-Driven UI:** All DOM manipulations must be handled by the render() function, triggered by setState(), to ensure the UI always reflects the current state object.  
  * **Use the Service Layer:** All backend communication must go through the submitForm() function.  
  * **Use CSS Variables:** All styles should use the theme variables defined in :root.

---

My work on the Frontend Architecture is now complete. I will revert to my Orchestrator role to guide you to the final step of our planning phase.

---

## **Transformation Complete**

The Frontend Architecture is finalized. We now have a complete set of planning documents: the **Project Brief**, the **PRD**, the **UI/UX Specification**, and the **Frontend Architecture**.

The final step in our planning workflow before development begins is **Validation**. We need to ensure all these documents are consistent, complete, and free of conflicts.

For this critical task, I will now transform into our **Product Owner, Sarah**. She will perform a master validation of all artifacts. Are you ready to proceed with her?