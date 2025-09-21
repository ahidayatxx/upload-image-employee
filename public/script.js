
// --- CONFIGURATION ---
// URL for production (working endpoint)
const WEBHOOK_URL = 'https://n8n-jzx3s9q1s367.pempek.sumopod.my.id/webhook/upload-image';
// URL for development and testing
// const WEBHOOK_URL = 'https://n8n-jzx3s9q1s367.pempek.sumopod.my.id/webhook-test/upload-image';

// --- DOM ELEMENTS ---
const uploadForm = document.getElementById('upload-form');
const employeeNameSelect = document.getElementById('employee-name');
const submitBtn = document.getElementById('submit-btn');
const fileInput = document.getElementById('file-input');
const statusDiv = document.getElementById('status');

// --- STATE ---
const state = {
    isUploading: false,
    retryCount: 0,
    maxRetries: 3,
};

// --- RENDER FUNCTION ---
function render() {
    // Update button state and text
    if (state.isUploading) {
        submitBtn.classList.add('loading');
        submitBtn.querySelector('h3').textContent = 'Memproses...';
        submitBtn.querySelector('p').textContent = 'Mohon tunggu sebentar';
    } else {
        submitBtn.classList.remove('loading');
        submitBtn.querySelector('h3').textContent = 'Ambil Foto';
        submitBtn.querySelector('p').textContent = 'Gunakan kamera untuk mengambil foto';
    }
}

// Make functions available globally for testing
if (typeof window !== 'undefined') {
    window.render = render;
    window.showStatus = showStatus;
    window.hideStatus = hideStatus;
    window.state = state;
}

// --- HELPER FUNCTIONS ---
function showStatus(message, type) {
    statusDiv.textContent = message;
    statusDiv.className = `status ${type}`;
    statusDiv.style.display = 'block';
}

function hideStatus() {
    statusDiv.style.display = 'none';
}

function resetForm() {
    uploadForm.reset();
    hideStatus();
    state.retryCount = 0;
}

// Validate file before upload
function validateFile(file) {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (!file) {
        throw new Error('No file selected');
    }

    if (file.size > maxSize) {
        throw new Error('File size too large. Maximum size is 10MB.');
    }

    if (!allowedTypes.includes(file.type)) {
        throw new Error('Invalid file type. Please upload an image (JPEG, PNG, or WebP).');
    }

    return true;
}

// Retry logic for failed uploads
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Convert file to base64
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            // Remove the data URL prefix (data:image/jpeg;base64,)
            const base64 = reader.result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = error => reject(error);
    });
}

// --- API SERVICE ---
async function submitForm(employeeName, file) {
    console.log('Submitting as FormData:', { employeeName, file });

    // Convert file to base64 as fallback for n8n compatibility
    const base64Data = await fileToBase64(file);

    const formData = new FormData();
    formData.append('employeeName', employeeName);
    formData.append('contentType', file.type);
    formData.append('fileName', file.name);
    formData.append('fileSize', file.size.toString());
    // Send both binary file and base64 data for maximum compatibility
    formData.append('file', file, file.name);
    formData.append('imageData', base64Data);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
        // When using FormData with fetch, you MUST NOT set the Content-Type header.
        // The browser will automatically set it to multipart/form-data with the correct boundary.
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            body: formData,
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        console.log('Response status:', response.status, response.statusText);
        console.log('Response headers:', [...response.headers.entries()]);

        if (!response.ok) {
            let errorMessage;
            try {
                const errBody = await response.json();
                errorMessage = errBody.error || errBody.message || `HTTP ${response.status}: ${response.statusText}`;
            } catch {
                errorMessage = `HTTP ${response.status}: ${response.statusText}`;
            }
            throw new Error(errorMessage);
        }

        // Handle empty response body
        const contentLength = response.headers.get('content-length');
        if (contentLength === '0' || contentLength === null) {
            // Empty response - assume success
            return {
                success: true,
                message: 'File uploaded successfully',
                uploadTime: new Date().toISOString()
            };
        }

        try {
            return await response.json();
        } catch (error) {
            // If JSON parsing fails but response was successful, assume success
            if (response.status >= 200 && response.status < 300) {
                return {
                    success: true,
                    message: 'File uploaded successfully (no response body)',
                    uploadTime: new Date().toISOString()
                };
            }
            throw new Error(`Failed to parse response: ${error.message}`);
        }
    } catch (error) {
        clearTimeout(timeoutId);

        if (error.name === 'AbortError') {
            throw new Error('Request timed out. Please try again.');
        }

        throw error;
    }
}

// Enhanced submit with retry logic
async function submitFormWithRetry(employeeName, file) {
    let lastError;

    for (let attempt = 0; attempt <= state.maxRetries; attempt++) {
        try {
            if (attempt > 0) {
                const retryDelay = Math.min(1000 * Math.pow(2, attempt - 1), 5000); // Exponential backoff, max 5s
                showStatus(`Retrying... (attempt ${attempt + 1}/${state.maxRetries + 1})`, 'info');
                await delay(retryDelay);
            }

            state.retryCount = attempt;
            return await submitForm(employeeName, file);
        } catch (error) {
            lastError = error;
            console.warn(`Upload attempt ${attempt + 1} failed:`, error.message);

            // Don't retry for certain errors
            if (error.message.includes('Invalid file type') ||
                error.message.includes('File size too large') ||
                error.message.includes('400')) {
                throw error;
            }

            if (attempt === state.maxRetries) {
                throw new Error(`Upload failed after ${state.maxRetries + 1} attempts. Last error: ${lastError.message}`);
            }
        }
    }
}

// --- EVENT LISTENERS ---

// Handle action card click to trigger file input
submitBtn.addEventListener('click', (e) => {
    e.preventDefault();
    hideStatus();

    const selectedName = employeeNameSelect.value;
    if (!selectedName) {
        showStatus('Silakan pilih nama Anda terlebih dahulu.', 'error');
        return;
    }

    // Trigger the hidden file input
    fileInput.click();
});

// Handle the file selection
fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const employeeName = employeeNameSelect.value;

    // Set uploading state and render UI changes
    state.isUploading = true;
    render();

    try {
        // Validate file before upload
        validateFile(file);

        showStatus('Mengupload dan memproses foto...', 'info');

        // Use enhanced submit with retry logic
        const result = await submitFormWithRetry(employeeName, file);

        // Show success with additional details if available
        let successMessage = 'Foto berhasil diupload!';
        if (result.extractedText && result.extractedText !== 'OCR processing completed') {
            successMessage += ' Foto telah diproses dan disimpan.';
        }

        showStatus(successMessage, 'success');
        console.log('Upload successful:', result);

        setTimeout(() => {
            resetForm();
            state.isUploading = false;
            render();
        }, 3000); // Slightly longer to show success

    } catch (error) {
        console.error('Submission failed:', error);
        showStatus(`Kesalahan: ${error.message || 'Upload gagal. Silakan coba lagi.'}`, 'error');
        state.isUploading = false;
        render();

        // Clear file input on error so user can try again
        fileInput.value = '';
    }
});

// --- DEBUG FUNCTIONALITY ---
const testConnectionBtn = document.getElementById('test-connection-btn');
const debugOutput = document.getElementById('debug-output');

function logDebug(message) {
    const timestamp = new Date().toLocaleTimeString();
    debugOutput.innerHTML += `<div>[${timestamp}] ${message}</div>`;
    debugOutput.scrollTop = debugOutput.scrollHeight;
}

async function testConnection() {
    logDebug('Testing n8n webhook connection...');

    try {
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                test: true,
                employeeName: 'TestUser',
                contentType: 'application/json'
            })
        });

        logDebug(`Response status: ${response.status} ${response.statusText}`);
        logDebug(`Response headers: ${JSON.stringify([...response.headers.entries()])}`);

        const contentLength = response.headers.get('content-length');
        logDebug(`Content length: ${contentLength}`);

        if (contentLength === '0' || contentLength === null) {
            logDebug('✅ Empty response detected - this is expected');
        } else {
            try {
                const data = await response.json();
                logDebug(`Response body: ${JSON.stringify(data)}`);
            } catch (e) {
                logDebug(`❌ JSON parse error: ${e.message}`);
            }
        }

    } catch (error) {
        logDebug(`❌ Connection error: ${error.message}`);
    }
}

if (testConnectionBtn) {
    testConnectionBtn.addEventListener('click', testConnection);
}

// --- INITIALIZATION ---
render(); // Initial render on page load
