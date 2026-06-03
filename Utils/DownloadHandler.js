import path from "path";
import ActionsHelper from "../Actions/ActionHelper";
import { ActionTypes } from "./actions";
export default class Download {
  /**

     * @param {import("@playwright/test").Page} page - which will be used for page

     */

  static async handleDownload(page, elementLocator) {
    const __dirname = path.resolve(path.dirname(""));

    let fPath = path.join(path.join(__dirname, "./src"), "../Data/Download/");

    // Start waiting for download before clicking. Note no await.

    const downloadPromise = page.waitForEvent("download");

    const actionHelper = new ActionsHelper(page);

    await actionHelper.actionMethod(ActionTypes.CLICK, elementLocator);

    const download = await downloadPromise;

    // Wait for the download process to complete and save the downloaded file somewhere.

    const downloadPath = fPath + download.suggestedFilename();

    await download.saveAs(downloadPath);

    return downloadPath;
  }
}
