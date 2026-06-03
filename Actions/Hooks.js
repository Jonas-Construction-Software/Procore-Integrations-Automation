import { test } from "@playwright/test";
import Login from "../Helper/jdocLogin.js";
import { AppConfig } from "../config.js";
import Screenshot from "../Utils/Screenshot.js";
import fs from 'fs';
import path from 'path';


test.beforeEach(async ({ page }) => {
  await Login.login(page, AppConfig.UserName);
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