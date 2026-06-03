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
    await page.screenshot({
      path: path.join(screenshotDir, `${saveTitle}_${status}.png`),
      fullPage: true
    });
  }
}