import { defineConfig } from '@playwright/test';

export default defineConfig({
  testMatch: 'screenshot.spec.ts',
  use: {
    browserName: 'chromium',
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    locale: 'zh-CN',
  },
  snapshotPathTemplate: '{testDir}/screenshots/{arg}{ext}',
  expect: {
    toHaveScreenshot: {
      threshold: 0.02,
    },
  },
});
