import { test as base } from "@playwright/test";
import Login from "../Helper/Login.js";
import { AppConfig } from "../config.js";
import Screenshot from "../Utils/Screenshot.js";
import fs from 'fs';
import path from 'path';

const test = base.extend({
  page: async ({ browser }, use) => {
    const context = await browser.newContext({ viewport: null });
    const page = await context.newPage();
    await Login.loginToProcore(page);
    await use(page);
    await context.close();
  }
});


test.afterAll(async () => {
  // Cleanup temporary test files in Data folder
  const dataFolder = path.join(process.cwd(), 'Data');
  if (fs.existsSync(dataFolder)) {
    const files = fs.readdirSync(dataFolder);
    
    files.forEach((file) => {
      if (file.startsWith('test-doc-')) {
        const filePath = path.join(dataFolder, file);
        fs.unlinkSync(filePath);
      }
    });
  }

  const downloadFolder = path.join(process.cwd(), 'Data', 'Download');
  if (fs.existsSync(downloadFolder)) {
    const downloadFiles = fs.readdirSync(downloadFolder);
    
    downloadFiles.forEach((file) => {
      const filePath = path.join(downloadFolder, file);
      fs.unlinkSync(filePath);
    });
  }
});

export default test;