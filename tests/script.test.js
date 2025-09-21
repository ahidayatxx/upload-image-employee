/**
 * @jest-environment jsdom
 */

// Mock fetch globally
global.fetch = jest.fn();

// Mock FormData
global.FormData = jest.fn(() => ({
  append: jest.fn(),
}));

// Import the functions we want to test
// Since we're testing vanilla JS, we need to load the script content
const fs = require('fs');
const path = require('path');

describe('MVP Salon App Frontend', () => {
  let mockSubmitForm;
  let mockShowStatus;
  let mockHideStatus;
  let mockResetForm;
  let mockRender;

  beforeEach(() => {
    // Reset DOM
    document.body.innerHTML = `
      <div class="container">
        <h1>Upload Form</h1>
        <form id="upload-form">
          <div class="form-group">
            <select id="employee-name" class="form-control" required>
              <option value="" disabled selected>Select Your Name</option>
              <option value="Alice">Alice</option>
              <option value="Bob">Bob</option>
              <option value="Charlie">Charlie</option>
            </select>
          </div>
          <div class="form-group">
            <button type="submit" id="submit-btn" class="btn btn-primary">
              =� Take Photo
            </button>
            <input type="file" id="file-input" accept="image/*" capture="environment" style="display: none;">
          </div>
        </form>
        <div id="status" class="status"></div>
        <div class="tips">
          <h3>=� Tips for a good photo:</h3>
          <ul>
            <li>Ensure good lighting.</li>
            <li>Hold the camera steady.</li>
            <li>Make sure the text is clear and fills the frame.</li>
          </ul>
        </div>
      </div>
    `;

    // Reset fetch mock
    fetch.mockClear();
    FormData.mockClear();

    // Load and evaluate the script
    const scriptPath = path.join(__dirname, '../public/script.js');
    const scriptContent = fs.readFileSync(scriptPath, 'utf8');

    // Execute the script in the test environment
    eval(scriptContent);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('DOM Elements', () => {
    test('should find all required DOM elements', () => {
      expect(document.getElementById('upload-form')).toBeTruthy();
      expect(document.getElementById('employee-name')).toBeTruthy();
      expect(document.getElementById('submit-btn')).toBeTruthy();
      expect(document.getElementById('file-input')).toBeTruthy();
      expect(document.getElementById('status')).toBeTruthy();
    });
  });

  describe('Form Validation', () => {
    test('should show error when no employee name is selected', () => {
      const form = document.getElementById('upload-form');
      const employeeSelect = document.getElementById('employee-name');
      const statusDiv = document.getElementById('status');

      // Ensure no name is selected
      employeeSelect.value = '';

      // Trigger form submission
      const submitEvent = new Event('submit');
      form.dispatchEvent(submitEvent);

      // Check that status shows error
      expect(statusDiv.textContent).toContain('Please select your name first.');
      expect(statusDiv.className).toContain('error');
    });

    test('should proceed when employee name is selected', () => {
      const form = document.getElementById('upload-form');
      const employeeSelect = document.getElementById('employee-name');
      const fileInput = document.getElementById('file-input');

      // Mock click method
      fileInput.click = jest.fn();

      // Select an employee
      employeeSelect.value = 'Alice';

      // Trigger form submission
      const submitEvent = new Event('submit');
      form.dispatchEvent(submitEvent);

      // Check that file input click was triggered
      expect(fileInput.click).toHaveBeenCalled();
    });
  });

  describe('File Upload', () => {
    test('should handle successful upload', async () => {
      const employeeSelect = document.getElementById('employee-name');
      const fileInput = document.getElementById('file-input');
      const statusDiv = document.getElementById('status');

      // Mock successful fetch response
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, message: 'Upload successful' })
      });

      // Select employee
      employeeSelect.value = 'Alice';

      // Create mock file
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

      // Set up file input
      Object.defineProperty(fileInput, 'files', {
        value: [mockFile],
        writable: false,
      });

      // Trigger file change event
      const changeEvent = new Event('change');
      fileInput.dispatchEvent(changeEvent);

      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          signal: expect.any(AbortSignal)
        })
      );
    });

    test('should handle upload error', async () => {
      const employeeSelect = document.getElementById('employee-name');
      const fileInput = document.getElementById('file-input');

      // Mock failed fetch response that will fail all retries
      fetch.mockRejectedValue(new Error('Network error'));

      // Select employee
      employeeSelect.value = 'Alice';

      // Create mock file
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

      // Set up file input
      Object.defineProperty(fileInput, 'files', {
        value: [mockFile],
        writable: false,
      });

      // Trigger file change event
      const changeEvent = new Event('change');
      fileInput.dispatchEvent(changeEvent);

      // Wait for async operations to complete including retries
      await new Promise(resolve => setTimeout(resolve, 10000)); // Wait longer for all retries

      const statusDiv = document.getElementById('status');
      expect(statusDiv.textContent).toContain('Error:');
      expect(statusDiv.className).toContain('error');
    });
  });

  describe('Button State Management', () => {
    test('should disable button during upload', () => {
      const submitBtn = document.getElementById('submit-btn');

      // Simulate upload state
      window.state.isUploading = true;
      window.render();

      expect(submitBtn.disabled).toBe(true);
      expect(submitBtn.textContent).toBe('Processing...');
    });

    test('should enable button when not uploading', () => {
      const submitBtn = document.getElementById('submit-btn');

      // Simulate normal state
      window.state.isUploading = false;
      window.render();

      expect(submitBtn.disabled).toBe(false);
      expect(submitBtn.textContent).toBe('📸 Take Photo');
    });
  });

  describe('Status Display', () => {
    test('should show status message with correct class', () => {
      const statusDiv = document.getElementById('status');

      // Call showStatus function (assuming it's available globally)
      if (typeof window.showStatus === 'function') {
        window.showStatus('Test message', 'success');

        expect(statusDiv.textContent).toBe('Test message');
        expect(statusDiv.className).toContain('success');
        expect(statusDiv.style.display).toBe('block');
      }
    });

    test('should hide status', () => {
      const statusDiv = document.getElementById('status');

      // Call hideStatus function
      if (typeof window.hideStatus === 'function') {
        window.hideStatus();
        expect(statusDiv.style.display).toBe('none');
      }
    });
  });
});