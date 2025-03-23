import { VAR_FAILURE, VAR_partial, VAR_SUCCESS } from "../constants.js";

export enum BROWSER_ACTIONS {
  goto_page = "goto_page",
  click = "click",
  type = "type",
  click_and_type = "click_and_type",
  hover = "hover",
  drag = "drag",
  sleep = "sleep",
  scroll = "scroll",
}

export enum VERIFYACTION_STATUS {
  success = "success",
  failure = "failure",
  partial = "partial",
}
