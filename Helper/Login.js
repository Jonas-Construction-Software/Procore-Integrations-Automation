import ActionsHelper from "../Actions/ActionHelper.js";
import { loginPageLocators } from "../pageObjects/LoginObjects.js";
import { ActionTypes, AssertionType } from "../Utils/actions.js";
import { expect } from "@playwright/test";
import { AppConfig } from "../config.js";


export default new class Login {
  /**
   * Logs in with the given username and password.
   * Uses AppConfig.Password as default if no password is provided.
   */
  async login(page, username, password = null) {
    const actionHelper = new ActionsHelper(page);
    await actionHelper.actionMethod(ActionTypes.NAVIGATETOURL, null, AppConfig.BaseURL);
    await page.waitForLoadState("domcontentloaded");
    await page.waitForLoadState("load");
    await page.waitForSelector(loginPageLocators.usernameInput, { 
      state: 'visible', 
      timeout: 60000 
    });
    await actionHelper.actionMethod(ActionTypes.SETTEXT, loginPageLocators.usernameInput, username);
    await actionHelper.actionMethod(ActionTypes.SETTEXT, loginPageLocators.passwordInput, password || AppConfig.Password);
    await actionHelper.actionMethod(ActionTypes.CLICK, loginPageLocators.signInButton);
    await page.waitForLoadState("domcontentloaded");
    await page.waitForLoadState("load");
    await expect(page).toHaveTitle(loginPageLocators.pageTitle, { timeout: 60000 });
  }

  /**
   * Logs in with a secondary user account (for multi-user scenarios).
   */
  async loginSecondClient(page) {
    await this.login(page, AppConfig.SecondUserName, AppConfig.SecondUserPassword);
  }
}

