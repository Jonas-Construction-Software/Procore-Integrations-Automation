import test from "../Actions/Hooks.js";
import '../Actions/Hooks.js';
import { AppConfig } from "../config.js";
import ActionsHelper from "../Actions/ActionHelper.js";
import { ActionTypes, AssertionType } from "../Utils/actions.js";
import { loginPageLocators } from "../pageObjects/LoginObjects.js";
import { expect } from '@playwright/test';


test.describe("Smoke Tests", { tag: ['@smoke'] }, () => {

  test("Verify user can login successfully", async ({ page }) => {
    const actionHelper = new ActionsHelper(page);
    // After login (handled by Hooks.js beforeEach), verify we're on the landing page
    await expect(page).toHaveTitle(loginPageLocators.pageTitle, { timeout: 60000 });
  });

});
