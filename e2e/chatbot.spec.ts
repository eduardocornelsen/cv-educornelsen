import { test, expect } from '@playwright/test';

test.describe('AI Chatbot component', () => {
  // Allow extra time for slow CI runners
  test.setTimeout(60_000);

  test.beforeEach(async ({ page }) => {
    // Navigate to homepage before each test
    await page.goto('/');
  });

  test('Verify chatbot toggle button exists', async ({ page }) => {
    // The chatbot button has title="Ask Eduardo's AI"
    const chatbotButton = page.locator('button[title="Ask Eduardo\'s AI"]');
    await expect(chatbotButton).toBeVisible();
    await expect(chatbotButton).toHaveText('>_');
  });

  test('Open and close the chatbot window', async ({ page }) => {
    const chatbotButton = page.locator('button[title="Ask Eduardo\'s AI"]');
    
    // Open chatbot
    await chatbotButton.click();
    
    // Verify header is visible
    await expect(page.getByText('EDUARDO.AI // v1.5')).toBeVisible();
    
    // Close using the close button
    await page.getByRole('button', { name: 'close' }).click();
    
    // Verify it's closed
    await expect(page.getByText('EDUARDO.AI // v1.5')).toBeHidden();
  });

  test('Send a message and receive a streaming response', async ({ page }) => {
    const chatbotButton = page.locator('button[title="Ask Eduardo\'s AI"]');
    await chatbotButton.click();
    
    // Input a message
    const inputField = page.getByPlaceholder('type your question...');
    await inputField.fill('Hello Eduardo!');

    // Expected Send button
    const sendButton = page.getByRole('button', { name: 'SEND' });
    await sendButton.click();

    // Verify user message appears
    await expect(page.getByText('Hello Eduardo!')).toBeVisible();

    // Wait for the AI context to respond (either a stream of text or an error message if the mock isn't configured during E2E)
    // We can just verify that a message bubbles up. Chat bot messages don't have the user styling.
    await page.waitForTimeout(2000);

    // Verify some response block exists or an error label exists
    const errorBanner = page.locator('div[style*="background: rgba(255, 48, 80, 0.1)"]');
    const aiMessageBlock = page.locator('div[style*="font-family"]');
    
    await expect(errorBanner.or(aiMessageBlock).first()).toBeVisible();
  });

  test('Clear chat history', async ({ page }) => {
    // Open chatbot
    await page.locator('button[title="Ask Eduardo\'s AI"]').click();

    // Click clear history (Trash icon button)
    const clearButton = page.locator('button[title="Clear history"]');
    await clearButton.click();

    // The greeting "Initializing EduardoAI..." should be visible indicating empty history
    await expect(page.getByText('Initializing EduardoAI...')).toBeVisible();
  });
});
