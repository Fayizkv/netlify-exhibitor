/**
 * Test utilities for EventHex SaaS CMS
 */

/**
 * Wait for page to be fully loaded
 * @param {import('@playwright/test').Page} page 
 */
export async function waitForPageLoad(page) {
  await page.waitForLoadState('networkidle');
  await page.waitForLoadState('domcontentloaded');
}

/**
 * Login helper function
 * @param {import('@playwright/test').Page} page 
 * @param {string} email 
 * @param {string} password 
 */
export async function login(page, email, password) {
  await page.goto('/login');
  
  // Fill login form
  await page.fill('input[type="email"], input[name="email"]', email);
  await page.fill('input[type="password"], input[name="password"]', password);
  
  // Submit form
  await page.click('button[type="submit"], button:has-text("Login")');
  
  // Wait for navigation
  await page.waitForURL('**/dashboard**', { timeout: 10000 });
}

/**
 * Navigate to a specific page
 * @param {import('@playwright/test').Page} page 
 * @param {string} path 
 */
export async function navigateTo(page, path) {
  await page.goto(path);
  await waitForPageLoad(page);
}

/**
 * Fill form fields
 * @param {import('@playwright/test').Page} page 
 * @param {Object} formData 
 */
export async function fillForm(page, formData) {
  for (const [fieldName, value] of Object.entries(formData)) {
    const selector = `input[name="${fieldName}"], textarea[name="${fieldName}"], select[name="${fieldName}"]`;
    const element = page.locator(selector);
    
    if (await element.count() > 0) {
      await element.fill(value);
    }
  }
}

/**
 * Submit form
 * @param {import('@playwright/test').Page} page 
 * @param {string} submitButtonText 
 */
export async function submitForm(page, submitButtonText = 'Submit') {
  await page.click(`button:has-text("${submitButtonText}"), button[type="submit"]`);
}

/**
 * Wait for toast notification
 * @param {import('@playwright/test').Page} page 
 * @param {string} message 
 */
export async function waitForToast(page, message) {
  await page.waitForSelector(`[class*="toast"], [class*="notification"]:has-text("${message}")`, { timeout: 5000 });
}

/**
 * Check if element exists and is visible
 * @param {import('@playwright/test').Page} page 
 * @param {string} selector 
 * @returns {Promise<boolean>}
 */
export async function elementExists(page, selector) {
  const element = page.locator(selector);
  return await element.count() > 0 && await element.isVisible();
}

/**
 * Get element text safely
 * @param {import('@playwright/test').Page} page 
 * @param {string} selector 
 * @returns {Promise<string>}
 */
export async function getElementText(page, selector) {
  const element = page.locator(selector);
  if (await element.count() > 0) {
    return await element.textContent();
  }
  return '';
}

/**
 * Click element safely
 * @param {import('@playwright/test').Page} page 
 * @param {string} selector 
 */
export async function clickSafely(page, selector) {
  const element = page.locator(selector);
  if (await element.count() > 0 && await element.isVisible()) {
    await element.click();
  }
}

/**
 * Wait for API response
 * @param {import('@playwright/test').Page} page 
 * @param {string} urlPattern 
 */
export async function waitForAPIResponse(page, urlPattern) {
  await page.waitForResponse(response => 
    response.url().includes(urlPattern) && response.status() === 200
  );
}

/**
 * Take screenshot with timestamp
 * @param {import('@playwright/test').Page} page 
 * @param {string} name 
 */
export async function takeScreenshot(page, name) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  await page.screenshot({ path: `screenshots/${name}-${timestamp}.png` });
}

/**
 * Generate random test data
 * @param {string} type 
 * @returns {string}
 */
export function generateTestData(type) {
  const timestamp = Date.now();
  
  switch (type) {
    case 'email':
      return `test-${timestamp}@example.com`;
    case 'name':
      return `Test User ${timestamp}`;
    case 'title':
      return `Test Title ${timestamp}`;
    case 'description':
      return `Test description for ${timestamp}`;
    default:
      return `test-${timestamp}`;
  }
}

/**
 * Check if running in CI environment
 * @returns {boolean}
 */
export function isCI() {
  return process.env.CI === 'true';
}

/**
 * Retry function for flaky operations
 * @param {Function} fn 
 * @param {number} maxRetries 
 * @param {number} delay 
 */
export async function retry(fn, maxRetries = 3, delay = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}


