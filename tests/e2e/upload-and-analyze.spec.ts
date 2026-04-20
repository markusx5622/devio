import { test, expect } from '@playwright/test';
import path from 'path';

const DEMO_STABLE = path.resolve(__dirname, '../../public/demo/proceso-estable.csv');
const DEMO_SPIKE = path.resolve(__dirname, '../../public/demo/causa-asignable.csv');

test.describe('Landing page', () => {
  test('loads and shows CTA button', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Devio/i);
    const cta = page.getByRole('link', { name: /Dashboard|Ir al Dashboard/i }).first();
    await expect(cta).toBeVisible();
  });
});

test.describe('Dashboard', () => {
  test('navigating to /app shows UploadDropzone', async ({ page }) => {
    await page.goto('/app');
    const dropzone = page.getByRole('button', { name: /Arrastra tu archivo/i });
    await expect(dropzone).toBeVisible();
  });

  test('loading "Proceso estable" demo shows ControlChart', async ({ page }) => {
    await page.goto('/app');

    // Open demo selector
    await page.getByRole('button', { name: /Cargar ejemplo/i }).click();

    // Click "Proceso estable"
    await page.getByRole('button', { name: /Proceso estable/i }).click();

    // Analyze button should appear
    const analyzeBtn = page.getByRole('button', { name: /Analizar/i });
    await expect(analyzeBtn).toBeVisible();
    await analyzeBtn.click();

    // Wait for results — SummaryStrip and chart headers
    await expect(page.getByText(/Cartas de Control/i)).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/Carta de Medias/i)).toBeVisible();
  });

  test('loading "Causa asignable" shows at least one violation', async ({ page }) => {
    await page.goto('/app');

    await page.getByRole('button', { name: /Cargar ejemplo/i }).click();
    await page.getByRole('button', { name: /Causa asignable/i }).click();

    await page.getByRole('button', { name: /Analizar/i }).click();

    // ViolationTable badge should show violations
    await expect(page.getByText(/violacion/i)).toBeVisible({ timeout: 15_000 });
  });

  test('ControlChart renders UCL, CL, LCL labels', async ({ page }) => {
    await page.goto('/app');

    await page.getByRole('button', { name: /Cargar ejemplo/i }).click();
    await page.getByRole('button', { name: /Proceso estable/i }).click();
    await page.getByRole('button', { name: /Analizar/i }).click();

    await expect(page.getByText('UCL').first()).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText('CL').first()).toBeVisible();
    await expect(page.getByText('LCL').first()).toBeVisible();
  });
});
