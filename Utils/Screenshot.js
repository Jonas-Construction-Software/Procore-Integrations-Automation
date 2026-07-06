import path from "path";
import fs from "fs";

export default class Screenshot {
  static async takeScreenshot(page, title, actualStatus) {
    let status = "Passed";
    const saveTitle = title.replace(/[^a-zA-Z0-9]/g, "_");
    if (actualStatus.toLowerCase() !== "passed") {
      status = "Failed";
    }
    const screenshotDir = path.join(process.cwd(), "Screenshots");
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }
    // Scroll to top so the blue nav bar appears at the top of the full-page screenshot
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({
      path: path.join(screenshotDir, `${saveTitle}_${status}.png`),
      fullPage: true
    });
  }
}