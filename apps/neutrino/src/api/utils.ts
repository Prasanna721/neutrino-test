import { Page } from "playwright";
import { ScreenDimensions } from "./interfaces.js";
import { Action, VerifyAction } from "../actions.js";
import { Driver, BASE_MODEL, ModelPrompt } from "../drivers/index.js";
import { VAR_JSON, VAR_SUCCESS } from "../constants.js";
import { VERIFYACTION_STATUS } from "../types/enums.js";
import AnthropicAdapter from "../drivers/anthropic.js";

export const getScreenDimensions = async (
  page: Page
): Promise<ScreenDimensions> => {
  const viewport = page.viewportSize();
  const windowDimensions = await page.evaluate(() => ({
    width: window.innerWidth,
    height: window.innerHeight,
    outerWidth: window.outerWidth,
    outerHeight: window.outerHeight,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
  }));

  const dimensions: ScreenDimensions = {
    viewport,
    window: windowDimensions,
  };

  return dimensions;
};

export const processCurrentView = async (
  task: string,
  dimensions: ScreenDimensions,
  path: string
): Promise<Action> => {
  const data = {
    task: task,
    screen_dimensions: dimensions,
    timestamp: new Date().toISOString(),
  };

  const messagesRes = ModelPrompt.claudeAction(data);
  const modelAdapter = new AnthropicAdapter();
  await modelAdapter.constructPayload(messagesRes.prompt, [path], null);
  const action = await modelAdapter.generateResponse(
    messagesRes.type == VAR_JSON
  );
  return action;
};

export const verifyTask = async (
  task: string,
  action: Action,
  prevViewPath: string,
  currentViewPath: string
): Promise<VerifyAction> => {
  const data = {
    task: task,
    action: action,
  };

  const messagesRes = ModelPrompt.claudeVerifyAction(data);
  const modelAdapter = new AnthropicAdapter();
  await modelAdapter.constructPayload(
    `This is the webpage previous_view before executing task: ${data.task}`,
    [prevViewPath],
    null
  );
  await modelAdapter.constructPayload(
    `This is the webpage current_view`,
    [currentViewPath],
    null
  );
  await modelAdapter.constructPayload(messagesRes.prompt, null, null);
  const response = await modelAdapter.generateResponse(
    messagesRes.type == VAR_JSON
  );
  return response;
};
