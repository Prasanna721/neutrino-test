import { Page } from "playwright";
import { ScreenDimensions } from "./interfaces.js";
import { Action, VerifyAction } from "../actions.js";
import { Driver, BASE_MODEL, ModelPrompt } from "../drivers/index.js";
import { VAR_JSON, VAR_SUCCESS } from "../constants.js";
import { VERIFYACTION_STATUS } from "../types/enums.js";
import AnthropicAdapter, { ANTHROPIC_MODEL } from "../drivers/anthropic.js";
import { ChatAnthropic } from "@langchain/anthropic";
import {
  formatNextStep,
  formatPreviousAction,
  getProcessTestStepPrompt,
  getProcessTestStepPromptV2,
  getTestflowPrompt,
} from "../prompts/messages.js";

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

export const extractTagContents = (text: string): Record<string, string> => {
  const regex: RegExp = /<([a-zA-Z0-9_]+)>([\s\S]*?)<\/\1>/g;
  const result: Record<string, string> = {};

  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    const tag = match[1];
    const content: string = match[2]?.trim() || "";

    if (tag) {
      if (result[tag]) {
        result[tag] += content;
      } else {
        result[tag] = content;
      }
    }
  }

  return result;
};

export const generateTestStepFlow = async (
  chat: ChatAnthropic,
  testStep: string,
  path: string
): Promise<{ [tag: string]: string }> => {
  const testStepFlowObj = getTestflowPrompt({ TEST_STEP: testStep });
  let messages = await AnthropicAdapter.constructPayload(
    testStepFlowObj.user_content,
    [path],
    testStepFlowObj.system_content
  );

  const res = await chat.invoke(messages);
  console.log("generateTestStepFlow USAGE:", res.response_metadata.usage);

  return extractTagContents(res.content.toString());
};

export const evaluateTestStepFlow = async (
  chat: ChatAnthropic,
  testStepFlows: { [tag: string]: string },
  screenDimensions: ScreenDimensions,
  images: string[]
): Promise<{ [tag: string]: string }> => {
  let previousAction: string = "";
  let nextStep: string = "";
  if (testStepFlows.previous_action) {
    previousAction = formatPreviousAction(testStepFlows.previous_action);
  }
  if (testStepFlows.next_step) {
    nextStep = formatNextStep(testStepFlows.next_step);
  }
  const processTestStepPrompt = getProcessTestStepPromptV2({
    SCREEN_DIMENSIONS: screenDimensions,
    TEST_STEP_ANALYSIS: testStepFlows.test_step_analysis,
    VISUAL_STEPS: testStepFlows.visual_steps,
    ACTION_STEPS: testStepFlows.action_steps,
    EXECUTION_NOTES: testStepFlows.execution_notes,
    PREVIOUS_ACTION: previousAction,
    NEXT_TESTSTEP: nextStep,
  });
  const messages = await AnthropicAdapter.constructPayload(
    processTestStepPrompt.user_content,
    images,
    processTestStepPrompt.system_content
  );

  const res = await chat.invoke(messages);
  console.log("evaluateTestStepFlow USAGE:", res.response_metadata.usage);

  return extractTagContents(res.content.toString());
};
