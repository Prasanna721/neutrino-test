import AnthropicAdapter from "./anthropic.js";
import { claudeAction, claudeVerifyAction } from "../prompts/messages.js";
import OpenAIAdapter from "./openai.js";

export enum BASE_MODEL {
  GOOGLE = "google",
  OPENAI = "openai",
  ANTHROPIC = "anthropic",
}
export const Driver = (base_model: BASE_MODEL = BASE_MODEL.ANTHROPIC) => {
  if (base_model === BASE_MODEL.OPENAI) {
    return new OpenAIAdapter();
  }
  return new AnthropicAdapter();
};

export const ModelPrompt = {
  claudeAction: claudeAction,
  claudeVerifyAction: claudeVerifyAction,
};
