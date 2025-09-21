import { test, expect } from '@playwright/test';

test.describe('MVP Salon App E2E Tests', () => {
  const BASE_URL = 'http://localhost:3000';

  test.beforeEach(async ({ page }) => {
    // Intercept the webhook call to avoid hitting the real endpoint
    await page.route('**/webhook**/upload-image', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Image uploaded successfully to Google Drive',
          fileId: 'mock-file-id',
          fileName: 'mock-file-name.jpg',
          uploadTime: new Date().toISOString()
        })
      });
    });

    await page.goto(BASE_URL);
  });

  test('should load the page with all required elements', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle('Form Uploader');

    // Check main heading
    await expect(page.locator('h1')).toContainText('Upload Form');

    // Check form elements exist
    await expect(page.locator('#employee-name')).toBeVisible();
    await expect(page.locator('#submit-btn')).toBeVisible();
    await expect(page.locator('#file-input')).toBeHidden(); // Should be hidden

    // Check tips section
    await expect(page.locator('.tips')).toBeVisible();
    await expect(page.locator('.tips h3')).toContainText('Tips for a good photo');
  });

  test('should show error when submitting without selecting employee', async ({ page }) => {
    // Try to submit without selecting an employee
    await page.click('#submit-btn');

    // Check that error message appears
    await expect(page.locator('#status')).toBeVisible();
    await expect(page.locator('#status')).toContainText('Please select your name first.');
    await expect(page.locator('#status')).toHaveClass(/error/);
  });

  test('should enable file selection when employee is selected', async ({ page }) => {
    // Select an employee
    await page.selectOption('#employee-name', 'Alice');

    // Mock the file input behavior since we can't really trigger camera
    await page.evaluate(() => {
      const fileInput = document.getElementById('file-input');
      fileInput.click = () => {
        // Simulate file selection
        const file = new File(['test image data'], 'test.jpg', { type: 'image/jpeg' });
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInput.files = dataTransfer.files;

        // Trigger change event
        const event = new Event('change', { bubbles: true });
        fileInput.dispatchEvent(event);
      };
    });

    // Click submit button
    await page.click('#submit-btn');

    // Should not show name selection error
    const statusElement = page.locator('#status');
    const isVisible = await statusElement.isVisible();
    if (isVisible) {
      await expect(statusElement).not.toContainText('Please select your name first.');
    }
  });

  test('should handle successful upload flow', async ({ page }) => {
    // Select an employee
    await page.selectOption('#employee-name', 'Alice');

    // Mock file upload process
    await page.evaluate(() => {
      const fileInput = document.getElementById('file-input');
      const originalClick = fileInput.click;

      fileInput.click = async () => {
        // Simulate file selection and upload
        const file = new File(['test image data'], 'test.jpg', { type: 'image/jpeg' });
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInput.files = dataTransfer.files;

        // Trigger change event which will start the upload
        const event = new Event('change', { bubbles: true });
        fileInput.dispatchEvent(event);
      };
    });

    // Click submit button
    await page.click('#submit-btn');

    // Wait for upload process
    await page.waitForTimeout(1000);

    // Check for success message
    await expect(page.locator('#status')).toContainText('Form submitted successfully!');
    await expect(page.locator('#status')).toHaveClass(/success/);
  });

  test('should disable button during upload', async ({ page }) => {
    await page.selectOption('#employee-name', 'Bob');

    // Mock file upload with delay
    await page.evaluate(() => {
      const fileInput = document.getElementById('file-input');
      fileInput.click = async () => {
        const file = new File(['test image data'], 'test.jpg', { type: 'image/jpeg' });
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInput.files = dataTransfer.files;

        const event = new Event('change', { bubbles: true });
        fileInput.dispatchEvent(event);
      };
    });

    await page.click('#submit-btn');

    // Check that button is disabled and text changes
    await expect(page.locator('#submit-btn')).toBeDisabled();
    await expect(page.locator('#submit-btn')).toContainText('Processing...');

    // Wait for completion and check button is re-enabled
    await page.waitForTimeout(2500);
    await expect(page.locator('#submit-btn')).toBeEnabled();
    await expect(page.locator('#submit-btn')).toContainText('=ø Take Photo');
  });

  test('should handle upload errors gracefully', async ({ page }) => {
    // Override the route to return an error
    await page.route('**/webhook**/upload-image', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: 'Failed to upload image to Google Drive'
        })
      });
    });

    await page.selectOption('#employee-name', 'Charlie');

    await page.evaluate(() => {
      const fileInput = document.getElementById('file-input');
      fileInput.click = async () => {
        const file = new File(['test image data'], 'test.jpg', { type: 'image/jpeg' });
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInput.files = dataTransfer.files;

        const event = new Event('change', { bubbles: true });
        fileInput.dispatchEvent(event);
      };
    });

    await page.click('#submit-btn');

    // Wait for error to appear
    await page.waitForTimeout(1000);

    // Check for error message
    await expect(page.locator('#status')).toContainText('Error:');
    await expect(page.locator('#status')).toHaveClass(/error/);
  });

  test('should be mobile responsive', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Check that elements are still visible and properly sized
    await expect(page.locator('.container')).toBeVisible();
    await expect(page.locator('#employee-name')).toBeVisible();
    await expect(page.locator('#submit-btn')).toBeVisible();

    // Check that the container doesn't overflow
    const container = page.locator('.container');
    const boundingBox = await container.boundingBox();
    expect(boundingBox.width).toBeLessThanOrEqual(375);
  });

  test('should handle network failures', async ({ page }) => {
    // Simulate network failure
    await page.route('**/webhook**/upload-image', async route => {
      await route.abort('failed');
    });

    await page.selectOption('#employee-name', 'Alice');

    await page.evaluate(() => {
      const fileInput = document.getElementById('file-input');
      fileInput.click = async () => {
        const file = new File(['test image data'], 'test.jpg', { type: 'image/jpeg' });
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInput.files = dataTransfer.files;

        const event = new Event('change', { bubbles: true });
        fileInput.dispatchEvent(event);
      };
    });

    await page.click('#submit-btn');

    // Wait for error to appear
    await page.waitForTimeout(1000);

    // Check for network error message
    await expect(page.locator('#status')).toContainText('Error:');
    await expect(page.locator('#status')).toHaveClass(/error/);
  });
});