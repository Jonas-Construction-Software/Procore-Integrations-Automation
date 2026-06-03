import { expect } from "@playwright/test";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default class WebActions {
  constructor(page) {
    this.page = page;
  }

  async navigateToURL(url) {
    await this.page.goto(url);
  }

  async waitForFrameAttached(locator) {
    return await this.page.frameLocator(locator);
  }

  async waitForNestedFrameAttached(frame, locator) {
    return await frame.frameLocator(locator);
  }

  async waitForElementAttached(locator) {
    let elementLocator = await this.page.locator(locator);

    await (await elementLocator.first()).waitFor({ timeout: 20 * 1000 });

    return elementLocator;
  }

  async waitForElementAttachedVerification(locator) {
    let elementLocator = await this.page.locator(locator);

    return elementLocator;
  }

  async waitForFrameElementAttached(frame, locator) {
    let frameElement = frame.locator(locator);

    await frameElement.first().waitFor({ timeout: 20 * 1000 });

    return frameElement;
  }

  async waitForFrameElementAttachedVerificaiton(frame, locator) {
    let frameElement = frame.locator(locator);

    return frameElement;
  }
  async delay(time) {
    return new Promise(function (resolve) {
      setTimeout(resolve, time);
    });
  }

  async elementLocatorFunction(locator, frame) {
    if (frame.length !== 0) {
      const frameElement = await this.multiFrameHandling(frame);

      return await this.waitForFrameElementAttached(frameElement, locator);
    }

    return await this.waitForElementAttached(locator);
  }

  async elementLocatorFunctionVerification(locator, frame) {
    if (frame.length !== 0) {
      const frameElement = await this.multiFrameHandling(frame);

      return await this.waitForFrameElementAttachedVerificaiton(
        frameElement,
        locator,
      );
    }

    return await this.waitForElementAttachedVerification(locator);
  }

  async clickElement(locator, frame) {
    var elementFound = await this.elementLocatorFunction(locator, frame);

    await elementFound.click({ timeout: 20 * 1000 });
  }

  async clickElementJS(locator, frame) {
    var elementFound = await this.elementLocatorFunction(locator, frame);

    await elementFound.evaluate((element) => element.click());
  }

  async doubleClickElement(locator, frame) {
    var elementFound = await this.elementLocatorFunction(locator, frame);

    await elementFound.dblclick();
  }
  async enterElementText(locator, text, frame) {
    var elementFound = await this.elementLocatorFunction(locator, frame);

    await elementFound.fill(text);
  }

  async checkElement(locator, frame) {
    var elementFound = await this.elementLocatorFunction(locator, frame);

    await elementFound.check();
  }

  async unCheckElement(locator, frame) {
    var elementFound = await this.elementLocatorFunction(locator, frame);

    await elementFound.uncheck();
  }

  async uploadFile(locator, fileName, frame) {
    if (frame.length !== 0) {
      const frameElement = await this.multiFrameHandling(frame);

      var elementFound = await this.waitForFrameElementAttachedVerificaiton(
        frameElement,
        locator,
      );
    } else {
      var elementFound = await this.waitForElementAttachedVerification(locator);
    }

    await elementFound.setInputFiles(
      path.join(__dirname, "..\\Data\\" + fileName),
    );
  }

  async selectOptionFromDropdown(locator, option, frame) {
    var elementFound = await this.elementLocatorFunction(locator, frame);

    await elementFound.selectOption({ label: option, timeout: 10000 });
  }

  async selectOptionFromDropdownViaValue(locator, option, frame) {
    var elementFound = await this.elementLocatorFunction(locator, frame);

    await elementFound.selectOption(option, { timeout: 10000 });
  }
  async hoverOver(locator, frame) {
    var elementFound = await this.elementLocatorFunction(locator, frame);
    await elementFound.hover();
  }
  async hoverOverForced(locator, frame) {
    var elementFound = await this.elementLocatorFunction(locator, frame);
    await elementFound.hover({ force: true });
  }
  async setAttribute(locator, attribute, value, frame) {
    var elementFound = await this.elementLocatorFunction(locator, frame);
    await elementFound.evaluate(
      (element, { attribute, value }) => {
        element[attribute] = value; // Set the 'src' attribute of the image
      },
      { attribute, value },
    );
  }
  async keyPress(locator, key, frame) {
    var elementFound = await this.elementLocatorFunction(locator, frame);
    await elementFound.press(key);
  }
  async verifyElementText(locator, text, frame) {
    var elementFound = await this.elementLocatorFunction(locator, frame);
    // const textValue = (await elementFound.inputValue()) || (await elementFound.textContent());
    const tagName = await elementFound.evaluate((node) =>
      node.tagName.toLowerCase(),
    );
    if (tagName === "input" || tagName === "textarea" || tagName === "select") {
      // If it's an input element, check the value
      await expect(elementFound).toHaveValue(text);
    } else {
      // Otherwise, check the text content
      await expect(elementFound).toHaveText(text);
    }
  }
  async verifyElementContainsText(locator, text, frame) {
    var elementFound = await this.elementLocatorFunction(locator, frame);

    await expect(elementFound).toContainText(text);
  }

  async verifyElementIsChecked(locator, frame) {
    var elementFound = await this.elementLocatorFunction(locator, frame);

    await expect(elementFound).toBeChecked();
  }

  async verifyElementNotChecked(locator, frame) {
    var elementFound = await this.elementLocatorFunction(locator, frame);

    await expect(elementFound).not.toBeChecked();
  }

  async verifyElementAttribute(locator, attribute, value, frame) {
    var elementFound = await this.elementLocatorFunction(locator, frame);

    if (value === null)
      throw "Value is set Null for the attribute verification";

    await expect(elementFound).toHaveAttribute(attribute, value);
  }
  async verifyElementAttributeNotExist(locator, attribute, frame) {
    var elementFound = await this.elementLocatorFunction(locator, frame);

    await expect(elementFound).not.toHaveAttribute(attribute);
  }

  async verifyElementNotExist(locator, frame) {
    var elementFound = await this.elementLocatorFunction(locator, frame);

    await expect(elementFound).toHaveCount(0);
  }

  async verifyElementIsDisplayed(locator, frame) {
    if (frame.length !== 0) {
      const frameElement = await this.multiFrameHandling(frame);

      var elementFound = await this.waitForFrameElementAttached(
        frameElement,
        locator,
      );
    } else var elementFound = await this.waitForElementAttached(locator);

    await expect(elementFound).toBeVisible({ timeout: 60000 });
  }

  async verifyElementIsNotDisplayed(locator, frame) {
    if (frame.length !== 0) {
      const frameElement = await this.multiFrameHandling(frame);

      var elementFound = await this.waitForFrameElementAttachedVerification(
        frameElement,
        locator,
      );
    } else {
      var elementFound = await this.waitForElementAttachedVerification(locator);
    }

    await expect(elementFound).not.toBeVisible();
  }
  async expectToBeTrue(status, errorMessage) {
    expect(status, `${errorMessage}`).toBe(true);
  }

  async expectToBeValue(expectedValue, actualValue, errorMessage) {
    expect(expectedValue.trim(), errorMessage).toBe(actualValue);
  }

  async verifyElementIsEnabled(locator, frame) {
    var elementFound = await this.elementLocatorFunction(locator, frame);

    await expect(elementFound).toBeEnabled();
  }

  async verifyElementIsDisabled(locator, frame) {
    var elementFound = await this.elementLocatorFunctionVerification(
      locator,
      frame,
    );

    await expect(elementFound).toBeDisabled();
  }

  async verifyElementIsHidden(locator, frame) {
    if (frame.length !== 0) {
      const frameElement = await this.multiFrameHandling(frame);

      var elementFound = await this.waitForFrameElementAttachedVerification(
        frameElement,
        locator,
      );
    } else {
      var elementFound = await this.waitForElementAttachedVerification(locator);
    }

    await expect(elementFound).toBeHidden({ timeout: 100 * 1000 });
  }

  async verifyHaveClass(locator, data, frame) {
    var elementFound = await this.elementLocatorFunction(locator, frame);

    await expect(elementFound).toHaveClass(data);
  }
  async verifyHaveClassPattern(locator, data, frame) {
    var elementFound = await this.elementLocatorFunction(locator, frame);
    await expect(elementFound).toHaveClass(new RegExp(data));
  }
  // async verifyElementIsDisplayed(locatorValue) {
  //   const elementFound = await this.waitForElementAttached(locatorValue);
  //   await expect(elementFound).toBeVisible();
  // }
  async verifyTableDataExists(locator, frame) {
    var elementFounds = await this.elementLocatorFunction(locator, frame);
    expect(await elementFounds.count()).toBeGreaterThan(0);
  }
  async multiFrameHandling(frame) {
    var frameElement = await this.waitForFrameAttached(frame[0]);
    frame.shift();
    while (frame.length > 0) {
      var frameElement = await this.waitForNestedFrameAttached(
        frameElement,
        frame[0],
      );
      frame.shift();
    }
    return frameElement;
  }
  async verifyElementPopulated(locator, frame) {
    var elementFound = await this.elementLocatorFunction(locator, frame);

    await expect(elementFound).not.toBeEmpty();
  }

  async verifyDateInBetween(locatorValue, fromText, toText, frame) {
    const rawActual = (await this.getTextContents(locatorValue, frame))?.trim();

    const rawFrom = String(fromText || "").trim();

    const rawTo = String(toText || "").trim();

    const parseDate = (s) => {
      const [month, day, year] = s.split(/[/\-]/).map(Number);

      return new Date(year, month - 1, day);
    };

    const actualDate = parseDate(rawActual);

    const fromDate = parseDate(rawFrom);

    const toDate = parseDate(rawTo);

    const min = fromDate < toDate ? fromDate : toDate;

    const max = fromDate > toDate ? fromDate : toDate;

    if (actualDate < min || actualDate > max) {
      throw new Error(
        `Date "${rawActual}" not in range [${rawFrom} - ${rawTo}]`,
      );
    }

    return true;
  }
  async getTextContents(locator, frame) {
    var elementFound = await this.elementLocatorFunction(locator, frame);
    const tagName = await elementFound.evaluate((node) =>
      node.tagName.toLowerCase(),
    );
    if (tagName === "input" || tagName === "textarea" || tagName === "select") {
      return await elementFound.inputValue();
    } else {
      return await elementFound.textContent();
    }
  }
  async getElement(locator, frame) {
    return await this.elementLocatorFunction(locator, frame);
  }
  async checkAndClickElement(selector) {
    let elementExists = false;
    elementExists = await this.verifyElementExist(selector);
    if (elementExists) {
      await this.clickElement(selector, []);
      // break;
    }
  }
  async verifyElementExist(selector) {
    try {
      await this.page.waitForSelector(selector, {
        state: "visible",
        timeout: 10000,
      });
      return true;
    } catch (error) {
      return false;
    }
  }
  async verifyTableDataExists(locator, frame) {
    var elementFounds = await this.elementLocatorFunction(locator, frame);
    expect(await elementFounds.count()).toBeGreaterThan(0);
  }
  async multiFrameHandling(frame) {
    var frameElement = await this.waitForFrameAttached(frame[0]);
    frame.shift();
    while (frame.length > 0) {
      var frameElement = await this.waitForNestedFrameAttached(
        frameElement,
        frame[0],
      );
      frame.shift();
    }
    return frameElement;
  }
}
