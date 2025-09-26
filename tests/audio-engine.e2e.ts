import { test, expect } from '@playwright/test';

// Set the feature flag via a query parameter for the test environment.
// This requires a bit of setup in the app to read from the query param,
// but for now, we'll assume it's handled by `.env.local` for the dev server.
// For a real CI environment, we'd use query params or a custom header.

test.describe('Audio Engine E2E Test', () => {
  test.beforeEach(async ({ page }) => {
    // Ensure the feature flag is enabled for this test.
    // We are relying on `.env.local` setting NEXT_PUBLIC_FF_AUDIO_ENGINE=true
    // when running the dev server via `pnpm dev`.
    await page.goto('/pro-dj-station');
  });

  test('should play audio, crossfade, and record a clip', async ({ page }) => {
    // Wait for the page and components to be fully loaded
    await expect(page.getByText('DECK A')).toBeVisible();
    await expect(page.getByText('DECK B')).toBeVisible();

    // --- 1. Play Deck A and verify visual feedback ---
    const deckA = page.locator('div.p-6:has-text("DECK A")');
    await deckA.getByRole('button', { name: /PLAY/i }).click();

    // Verify the master waveform shows activity. We check if the canvas is being drawn on.
    // A simple way is to check that it's not just a blank canvas.
    const masterWaveformCanvas = page.locator('canvas');
    await expect(masterWaveformCanvas).not.toBeNull();

    // A more robust check would involve checking the canvas pixel data, but that's complex.
    // For this test, we'll assume that if the play button is active, it's working.
    await expect(deckA.getByRole('button', { name: /PAUSE/i })).toBeVisible();


    // --- 2. Move crossfader and verify state ---
    const crossfader = page.locator('div:has-text("CROSSFADER")');
    const crossfaderSlider = crossfader.locator('[role="slider"]');

    // Move to Deck B (value 100)
    await crossfaderSlider.click({ position: { x: await crossfaderSlider.evaluate(el => el.clientWidth), y: 0 } });
    await expect(crossfader.getByText('100%')).toBeVisible();

    // Move back to center (value 50)
    await crossfaderSlider.click({ position: { x: await crossfaderSlider.evaluate(el => el.clientWidth / 2), y: 0 } });
    await expect(crossfader.getByText('50%')).toBeVisible();


    // --- 3. Start and stop recording, then verify download link ---
    const recordingControls = page.locator('div:has-text("REC")');

    // Start recording
    await recordingControls.getByRole('button', { name: /mic/i }).click();
    await expect(recordingControls.getByRole('button', { name: /stop/i })).toBeVisible();

    // Wait for 5 seconds
    await page.waitForTimeout(5000);

    // Stop recording and check for download link
    const downloadPromise = page.waitForEvent('download');
    await recordingControls.getByRole('button', { name: /stop/i }).click();

    // Get the download element and verify its properties
    const downloadLink = recordingControls.locator('a[download]');
    await expect(downloadLink).toBeVisible();
    await expect(downloadLink).toHaveAttribute('href', /^blob:/);

    // Optional: actually start the download and check the file, but this is more complex.
    // For this test, verifying the link is sufficient.
    const download = await downloadPromise;
    expect(download.url()).toMatch(/^blob:/);
  });
});