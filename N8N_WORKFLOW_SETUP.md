# n8n Workflow Setup Instructions

## Issue with Current Workflow

The current n8n workflow has a validation issue where it's not properly detecting image files uploaded via FormData. The validation condition needs to be updated to handle the file upload correctly.

## Solution

### Option 1: Re-import the Updated Workflow (Recommended)

1. **Backup your current workflow**:
   - Go to your n8n instance
   - Open the "MVP App Salon" workflow
   - Export it as backup before making changes

2. **Import the updated workflow**:
   - Delete the existing "MVP App Salon" workflow
   - Import the updated `MVP App Salon.json` file from this project
   - This file contains the fixes for:
     - Proper file type validation
     - Correct binary data handling
     - Better error messaging with debug info

3. **Configure credentials**:
   - Set up Google Drive OAuth2 API credentials
   - Set up Google Gemini (PaLM) API credentials
   - Update the Google Drive folder ID if different

4. **Activate the workflow**:
   - Make sure the workflow is activated
   - Test with the production webhook URL

### Option 2: Manual Fixes (If you prefer to keep existing workflow)

If you want to manually update your existing workflow instead of re-importing:

#### Fix 1: Update the "Validate Image" node

Change the condition in the "Validate Image" node from:
```
$json.contentType
```

To:
```
$json.contentType || $binary.file?.mimeType || 'unknown'
```

#### Fix 2: Update the "Upload file" node parameters

Add these parameters to the Google Drive "Upload file" node:
- **Name**: `{{ $json.employeeName }}_{{ new Date().toISOString().slice(0,19).replace(/:/g, '-') }}.{{ $binary.file.fileExtension || 'jpg' }}`
- **Binary Property Name**: `file`

#### Fix 3: Update error response for better debugging

In the "Error Response" node, update the response body to:
```json
{
  "success": false,
  "error": "Invalid file type. Only images are allowed.",
  "receivedType": "{{ $json.contentType || $binary.file?.mimeType || 'unknown' }}",
  "debugInfo": {
    "contentType": "{{ $json.contentType }}",
    "binaryMimeType": "{{ $binary.file?.mimeType }}",
    "hasFile": "{{ Object.keys($binary).length > 0 }}"
  }
}
```

## Testing the Workflow

After implementing the fixes:

1. **Test with curl**:
   ```bash
   curl -X POST "YOUR_N8N_WEBHOOK_URL" \
     -F "employeeName=TestUser" \
     -F "contentType=image/png" \
     -F "file=@/path/to/test/image.png"
   ```

2. **Test with the web application**:
   - Open the web app at your deployed URL
   - Select an employee name
   - Take or upload a photo
   - Verify successful upload and OCR processing

## Expected Workflow Flow

1. **Webhook receives**: FormData with employeeName, contentType, and file
2. **Validate Image**: Checks if the uploaded file is an image
3. **Upload file**: Saves image to Google Drive with formatted filename
4. **Check Upload Result**: Verifies upload success
5. **Analyze image**: Processes image with Google Vision OCR
6. **Success Response**: Returns success with extracted text

## Troubleshooting

### Common Issues:

1. **"Invalid file type" error**:
   - Ensure the validation condition includes `$binary.file?.mimeType`
   - Check that the file is actually being uploaded as binary data

2. **Google Drive upload fails**:
   - Verify Google Drive credentials are correctly configured
   - Check that the folder ID exists and is accessible
   - Ensure `binaryPropertyName` is set to "file"

3. **OCR not working**:
   - Verify Google Gemini credentials
   - Check that the model ID is correctly set to "gemini-1.5-flash"
   - Ensure the prompt is properly configured

4. **Workflow not triggering**:
   - Verify the webhook is activated
   - Check the webhook URL is correct in the frontend
   - Ensure n8n instance is running and accessible

## Updated Frontend Features

The frontend has been enhanced with:

- **Dual submission format**: Sends both FormData and base64 for maximum compatibility
- **Better error handling**: Retry logic with exponential backoff
- **File validation**: Type and size checking before upload
- **Enhanced status feedback**: Clear user messaging for all states

## Production Checklist

- [ ] n8n workflow imported and activated
- [ ] Google Drive credentials configured
- [ ] Google Gemini credentials configured
- [ ] Correct folder ID set in workflow
- [ ] Webhook URL updated in frontend code
- [ ] Frontend deployed to Vercel/Netlify
- [ ] End-to-end test completed successfully

## Support

If you encounter issues:

1. Check the n8n execution logs for detailed error messages
2. Use the debug information in error responses to identify issues
3. Verify all credentials and permissions are correctly set
4. Test individual workflow nodes manually in n8n

The updated workflow includes comprehensive error handling and debugging information to help troubleshoot any issues quickly.