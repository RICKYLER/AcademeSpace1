# TEST.TODO.MD

This document provides professional, step-by-step instructions for running each test script in the `/tests` directory. Each entry includes the test's purpose, setup requirements, detailed run instructions, and expected output.

---

## test-venice-direct.js
**Purpose:**
Test direct image generation using the Venice AI API, returning a base64-encoded image.

**Setup:**
- Ensure you have a Venice API key (`VITE_VENICE_IMAGE_API_KEY`) set in your environment.

**How to Run:**
1. Open a terminal and navigate to your project root directory.
2. Run the following command:L
   ```bash
   'node tests/test-venice-direct.js
   ```

**Expected Output:**
- Console logs with request/response details, including request ID, timing, and number of images. If successful, a base64 image string is returned.

---

## test-venice-styles.js
**Purpose:**
Fetch and display all available image styles from the Venice AI API.

**Setup:**
- Venice API key (`VITE_VENICE_IMAGE_API_KEY`) must be set.

**How to Run:**
1. In your project root, run:
   ```bash
   'node tests/test-venice-styles.js
   ```

**Expected Output:**
- Console output listing available styles and their descriptions. Handles authentication and server errors.

---

## test-venice-edit.js
**Purpose:**
Generate and edit (inpaint) an image using the Venice AI API. Saves both original and edited images.

**Setup:**
- Venice API key (`VITE_VENICE_IMAGE_API_KEY`) required.
- The script will create a `generated-photos` directory if it does not exist.

**How to Run:**
1. From the project root, execute:
   ```bash
   'node tests/test-venice-edit.js
   ```

**Expected Output:**
- Original and edited images saved to disk. Console logs with request IDs, file paths, and a summary of the edit.

---

## test-venice-upscale.js
**Purpose:**
Generate, upscale, and enhance an image using the Venice AI API. Saves the upscaled image.

**Setup:**
- Venice API key (`VITE_VENICE_IMAGE_API_KEY`) required.
- The script will create a `generated-photos` directory if it does not exist.

**How to Run:**
1. In the project root, run:
   ```bash
   'node tests/test-venice-upscale.js
   ```

**Expected Output:**
- Upscaled image saved to disk. Console logs with size increase and enhancement summary.

---

## test-venice-chat.js
**Purpose:**
Test the Venice AI chat completion API by sending a prompt and logging the AI's response.

**Setup:**
- Venice chat API key (`VITE_VENICE_CHAT_API_KEY`) required.

**How to Run:**
1. In your project root, run:
   ```bash
  ' node tests/test-venice-chat.js
   ```

**Expected Output:**
- Console logs with the AI's chat response and request ID. Handles authentication and network errors.

---

## test-venice.js
**Purpose:**
Test the local server's `/api/generate-image` endpoint using the Venice API provider.

**Setup:**
- Start the local server (`node scripts/server.js`).
- Venice API key required.

**How to Run:**
1. Ensure the server is running.
2. In your project root, run:
   ```bash
   'node tests/test-venice.js
   ```

**Expected Output:**
- Console logs with the image URL if successful. Checks server health before running the test.

---

## test-image-generation.js
**Purpose:**
Test the local `/api/generate-image` endpoint using OpenAI or Stability AI as the provider.

**Setup:**
- API token for OpenAI or Stability AI (replace `YOUR_API_TOKEN_HERE` in the script).
- Local server must be running.

**How to Run:**
1. Start the server if not already running.
2. In your project root, run:
   ```bash
  ' node tests/test-image-generation.js
   ```

**Expected Output:**
- Console logs with the generated image URL or error details.

---

## test-new-endpoint.js
**Purpose:**
Test the ForgeCode chat API endpoint using a Google Gemini model.

**Setup:**
- API token (hardcoded in the script).

**How to Run:**
1. In your project root, run:
   ```bash
  ' node tests/test-new-endpoint.js
   ```

**Expected Output:**
- Console logs with the API response and the AI's answer to the math question.

---

## test-real-api.js
**Purpose:**
Test the Forge API chat completions endpoint with a math tutor prompt.

**Setup:**
- API token (hardcoded in the script).

**How to Run:**
1. In your project root, run:
   ```bash
  ' node tests/test-real-api.js
   ```

**Expected Output:**
- Console logs with the API response and the AI's answer to the math question.
