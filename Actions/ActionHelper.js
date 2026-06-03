import { ActionTypes, AssertionType } from '../Utils/actions.js';
import WebActions from '../Utils/WebActions.js';
export default class ActionsHelper {
 webAction;
 assertionVerify;
 constructor(page) {
   this.page = page;
   this.webAction = new WebActions(page);
 }
 /**
  * @param {ActionType | AssertionType} actionType - Which Action you will be performing i.e Click, SetText, Verify
  * @param {string} locatorValue - The locator value
  * @param {string} dataToSet - Data to set in an EditText or pass it for other actions like double-click
  * @param {Array} frame - Which Assertion you want to apply
  */
 async actionMethod(actionType, locatorValue, dataToSet, ...frame) {
   switch (actionType) {
     case ActionTypes.CLICK:
       await this.webAction.clickElement(locatorValue, frame);
       break;
     case ActionTypes.CLICKVIAJS:
       await this.webAction.clickElementJS(locatorValue, frame);
       break;
     case ActionTypes.DOUBLECLICK:
       await this.webAction.doubleClickElement(locatorValue, frame);
       break;
     case ActionTypes.SETTEXT:
       await this.webAction.enterElementText(locatorValue, dataToSet, frame);
       break;
     case ActionTypes.PRESS:
       await this.webAction.keyPress(locatorValue, dataToSet, frame);
       break;
     case ActionTypes.CHECK:
       await this.webAction.checkElement(locatorValue, frame);
       break;
     case ActionTypes.UNCHECK:
       await this.webAction.unCheckElement(locatorValue, frame);
       break;
     case ActionTypes.UPLOADFILE:
       await this.webAction.uploadFile(locatorValue, dataToSet, frame);
       break;
     case ActionTypes.SETDROPDOWN:
       await this.webAction.selectOptionFromDropdown(locatorValue, dataToSet, frame);
       break;
     case ActionTypes.SETDROPDOWNVIAVALUE:
       await this.webAction.selectOptionFromDropdownViaValue(locatorValue, dataToSet, frame);
       break;
     case ActionTypes.HOVER:
       await this.webAction.hoverOver(locatorValue, frame);
       break;
     case ActionTypes.HOVER_FORCE:
       await this.webAction.hoverOverForced(locatorValue, frame);
       break;
     case ActionTypes.SETATTRIBUTE:
       await this.webAction.setAttribute(locatorValue, dataToSet, frame.shift(), frame);
       break;
     case ActionTypes.GETTEXT:
       const text = await this.webAction.getTextContents(locatorValue, frame);
       return text;
     case ActionTypes.RETURNELEMENT:
       return await this.webAction.getElement(locatorValue, frame);
     case ActionTypes.NAVIGATETOURL:
       await this.webAction.navigateToURL(dataToSet);
       break;
     /* ---------------- Assertions ---------------- */
     case AssertionType.EQUALCHECK:
       await this.webAction.verifyElementText(locatorValue, dataToSet, frame);
       break;
     case AssertionType.CONTAINTEXT:
       await this.webAction.verifyElementContainsText(locatorValue, dataToSet, frame);
       break;
     case AssertionType.DISPLAYED:
       await this.webAction.verifyElementIsDisplayed(locatorValue, frame);
       break;
     case AssertionType.ENABLED:
       await this.webAction.verifyElementIsEnabled(locatorValue, frame);
       break;
     case AssertionType.DISABLED:
       await this.webAction.verifyElementIsDisabled(locatorValue, frame);
       break;
     case AssertionType.TABLEDATAEXISTS:
       await this.webAction.verifyTableDataExists(locatorValue, frame);
       break;
     case AssertionType.PROPERTYCHECK:
       await this.webAction.verifyElementAttribute(
         locatorValue,
        frame.shift(),
        dataToSet,
         frame
       );
       break;
     case AssertionType.NOTDISPLAYED:
       await this.webAction.verifyElementIsNotDisplayed(locatorValue, frame);
       break;
     case AssertionType.ATTRIBUTENOTEXIST:
       await this.webAction.verifyElementAttributeNotExist(locatorValue, dataToSet, frame);
       break;
     case AssertionType.NOTEXIST:
       await this.webAction.verifyElementNotExist(locatorValue, frame);
       break;
     case AssertionType.ISHIDDEN:
       await this.webAction.verifyElementIsHidden(locatorValue, frame);
       break;
     case AssertionType.VERIFYHAVECLASS:
       await this.webAction.verifyHaveClass(locatorValue, dataToSet, frame);
       break;
     case AssertionType.VERIFYHAVECLASSPATTERN:
       await this.webAction.verifyHaveClassPattern(locatorValue, dataToSet, frame);
       break;
     case AssertionType.VERIFYELEMENTCHECKED:
       await this.webAction.verifyElementIsChecked(locatorValue, frame);
       break;
     case AssertionType.VERIFYELEMENTNOTCHECKED:
       await this.webAction.verifyElementNotChecked(locatorValue, frame);
       break;
     case AssertionType.POPULATED:
       await this.webAction.verifyElementPopulated(locatorValue, frame);
       break;
     case AssertionType.INBETWEEN:
       await this.webAction.verifyDateInBetween(
         locatorValue,
         dataToSet.from,
         dataToSet.to,
         frame
       );
       break;
     default:
       throw 'Wrong Type Passed: ' + actionType;
   }
 }
}