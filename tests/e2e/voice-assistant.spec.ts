import { test, expect } from '@playwright/test';

test.describe('Voice AI Assistant E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('renders header, state badge, microphone, and language selector', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Voice AI Agent');
    await expect(page.locator('#assistant-status-badge')).toBeVisible();
    await expect(page.locator('#voice-mic-main-button')).toBeVisible();
    await expect(page.locator('button[role="radio"]')).toHaveCount(6);
  });

  test('switches language between English, Malayalam, Hindi, and Tamil', async ({ page }) => {
    // Switch to Malayalam
    const malayalamBtn = page.locator('button[role="radio"]:has-text("മലയാളം")');
    await malayalamBtn.click();
    await expect(malayalamBtn).toHaveAttribute('aria-checked', 'true');

    // Switch to Hindi
    const hindiBtn = page.locator('button[role="radio"]:has-text("हिन्दी")');
    await hindiBtn.click();
    await expect(hindiBtn).toHaveAttribute('aria-checked', 'true');

    // Switch to Tamil
    const tamilBtn = page.locator('button[role="radio"]:has-text("தமிழ்")');
    await tamilBtn.click();
    await expect(tamilBtn).toHaveAttribute('aria-checked', 'true');
  });

  test('executes typed-input fallback and receives assistant response', async ({ page }) => {
    const input = page.locator('#text-fallback-input-field');
    const sendBtn = page.locator('#send-text-button');

    await input.fill('What are your clinic operating hours?');
    await sendBtn.click();

    // Verify user message appears in feed
    await expect(page.locator('#conversation-history-list')).toContainText('What are your clinic operating hours?');

    // Verify assistant responds with grounded clinic hours
    await expect(page.locator('#conversation-history-list')).toContainText('Monday to Saturday', { timeout: 15000 });
  });

  test('triggers consequential action confirmation modal on appointment booking', async ({ page }) => {
    const input = page.locator('#text-fallback-input-field');
    const sendBtn = page.locator('#send-text-button');

    await input.fill('I want to book an appointment for dental checkup');
    await sendBtn.click();

    // Verify confirmation modal opens
    const modal = page.locator('div[role="dialog"]');
    await expect(modal).toBeVisible({ timeout: 15000 });
    await expect(modal).toContainText('Confirmation Required');
    await expect(modal).toContainText('createBooking');

    // Test clicking Cancel
    const cancelBtn = page.locator('#cancel-action-button');
    await cancelBtn.click();

    // Verify cancelled state
    await expect(modal).not.toBeVisible();
    await expect(page.locator('#conversation-history-list')).toContainText('safely cancelled');
  });

  test('handles microphone permissions denial gracefully', async ({ page, context }) => {
    // Clear permissions to simulate prompt/denial
    await context.clearPermissions();

    const micBtn = page.locator('#voice-mic-main-button');
    await expect(micBtn).toBeVisible();

    // Text fallback remains functional
    const input = page.locator('#text-fallback-input-field');
    await expect(input).toBeEnabled();
  });
});
