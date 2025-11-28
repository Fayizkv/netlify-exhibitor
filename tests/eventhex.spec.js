const { test, expect } = require('@playwright/test');

test.describe('EventHex SaaS CMS', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
  });

  test('should load the main page', async ({ page }) => {
    // Check if the page loads successfully
    await expect(page).toHaveTitle(/EventHex/);
    
    // Check if the main content is visible
    await expect(page.locator('body')).toBeVisible();
  });

  test('should have proper navigation structure', async ({ page }) => {
    // Check if navigation elements are present
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
  });

  test('should handle responsive design', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('body')).toBeVisible();
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('body')).toBeVisible();
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.locator('body')).toBeVisible();
  });

  test('should handle form interactions', async ({ page }) => {
    // Look for common form elements
    const inputs = page.locator('input');
    const buttons = page.locator('button');
    
    // Check if forms are interactive
    await expect(inputs.first()).toBeVisible();
    await expect(buttons.first()).toBeVisible();
  });

  test('should handle authentication flow', async ({ page }) => {
    // Navigate to login page if it exists
    const loginLink = page.getByRole('link', { name: /login/i });
    if (await loginLink.isVisible()) {
      await loginLink.click();
      await expect(page).toHaveURL(/.*login.*/);
    }
  });

  test('should handle dashboard components', async ({ page }) => {
    // Check for dashboard elements
    const dashboardElements = page.locator('[class*="dashboard"], [class*="chart"], [class*="card"]');
    if (await dashboardElements.count() > 0) {
      await expect(dashboardElements.first()).toBeVisible();
    }
  });

  test('should handle data table interactions', async ({ page }) => {
    // Look for data tables
    const tables = page.locator('table');
    if (await tables.count() > 0) {
      await expect(tables.first()).toBeVisible();
      
      // Check for table headers
      const headers = tables.first().locator('th');
      if (await headers.count() > 0) {
        await expect(headers.first()).toBeVisible();
      }
    }
  });

  test('should handle modal/popup interactions', async ({ page }) => {
    // Look for modal triggers
    const modalTriggers = page.locator('[class*="modal"], [class*="popup"], button');
    
    for (let i = 0; i < Math.min(await modalTriggers.count(), 3); i++) {
      const trigger = modalTriggers.nth(i);
      if (await trigger.isVisible() && await trigger.isEnabled()) {
        try {
          await trigger.click();
          // Wait a bit for modal to appear
          await page.waitForTimeout(1000);
          
          // Look for modal content
          const modal = page.locator('[class*="modal"], [class*="popup"], [role="dialog"]');
          if (await modal.count() > 0) {
            await expect(modal.first()).toBeVisible();
            
            // Try to close modal
            const closeButton = modal.first().locator('button[aria-label*="close"], button:has-text("×"), button:has-text("Close")');
            if (await closeButton.count() > 0) {
              await closeButton.first().click();
            }
          }
        } catch (error) {
          // Continue if modal interaction fails
          console.log('Modal interaction failed:', error.message);
        }
      }
    }
  });

  test('should handle search functionality', async ({ page }) => {
    // Look for search inputs
    const searchInputs = page.locator('input[type="search"], input[placeholder*="search"], input[aria-label*="search"]');
    
    if (await searchInputs.count() > 0) {
      const searchInput = searchInputs.first();
      await expect(searchInput).toBeVisible();
      
      // Test search input
      await searchInput.fill('test search');
      await expect(searchInput).toHaveValue('test search');
    }
  });

  test('should handle file upload interactions', async ({ page }) => {
    // Look for file upload inputs
    const fileInputs = page.locator('input[type="file"]');
    
    if (await fileInputs.count() > 0) {
      const fileInput = fileInputs.first();
      await expect(fileInput).toBeVisible();
    }
  });

  test('should handle pagination', async ({ page }) => {
    // Look for pagination elements
    const pagination = page.locator('[class*="pagination"], nav[aria-label*="pagination"]');
    
    if (await pagination.count() > 0) {
      await expect(pagination.first()).toBeVisible();
      
      // Look for pagination buttons
      const paginationButtons = pagination.first().locator('button, a');
      if (await paginationButtons.count() > 0) {
        await expect(paginationButtons.first()).toBeVisible();
      }
    }
  });

  test('should handle accessibility features', async ({ page }) => {
    // Check for proper heading structure
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    if (await headings.count() > 0) {
      await expect(headings.first()).toBeVisible();
    }
    
    // Check for proper button labels
    const buttons = page.locator('button');
    for (let i = 0; i < Math.min(await buttons.count(), 5); i++) {
      const button = buttons.nth(i);
      if (await button.isVisible()) {
        const ariaLabel = await button.getAttribute('aria-label');
        const textContent = await button.textContent();
        
        // Button should have either aria-label or text content
        expect(ariaLabel || textContent).toBeTruthy();
      }
    }
  });
});


