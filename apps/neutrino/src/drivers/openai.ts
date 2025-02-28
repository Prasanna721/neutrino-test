/**
 * Adapter for Anthropic API with vision support.
 */

import * as dotenv from "dotenv";
import { promises as fs } from "fs";
import OpenAI from "openai";
import {
  ChatCompletionContentPart,
  ChatCompletionContentPartText,
  ChatCompletionCreateParamsNonStreaming,
  ChatCompletionMessageParam,
  ResponseFormatJSONSchema,
} from "openai/resources";
import { JSONSchema } from "openai/lib/jsonschema";

dotenv.config();

const MAX_TOKENS = 4096;
const MAX_IMAGES = 20;
export enum OPENAI_MODEL {
  gpt_4o = "gpt-4o-2024-11-20",
  o1 = "o1",
  o1_mini = "o1-mini",
  o3_mini = "o3-mini-2025-01-31",
}

class OpenAIAdapter {
  private openai: OpenAI;
  messages: Array<ChatCompletionMessageParam> = [];

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async constructPayload(
    prompt?: string,
    images?: string[] | null,
    system_prompt?: string | null
  ): Promise<Object> {
    const message_content: Array<
      ChatCompletionContentPartText | ChatCompletionContentPart
    > = [];
    if (system_prompt) {
      this.messages.push({
        role: "system",
        content: system_prompt,
      });
    }
    if (prompt) {
      message_content.push({
        type: "text",
        text: prompt,
      });
    }
    if (images) {
      images.forEach(async (image_path) => {
        const image = await fs.readFile(image_path);
        const image_base64_data = image.toString("base64");
        const media_type = "image/png";
        message_content.push({
          type: "image_url",
          image_url: {
            url: `data:${media_type};base64,${image_base64_data}`,
          },
        });
      });
    }
    if (message_content) {
      this.messages.push({
        role: "user",
        content: message_content,
      });
    }
    return this.messages;
  }

  async generateResponse(
    response_format: ResponseFormatJSONSchema | undefined,
    model = OPENAI_MODEL.gpt_4o,
    json = false
  ) {
    let data: ChatCompletionCreateParamsNonStreaming = {
      model: model,
      messages: this.messages,
      store: true,
    };
    if (response_format) {
      data["response_format"] = response_format;
    }
    const response = await this.openai.chat.completions.create(data);

    if (json) {
      const content = response.choices[0]?.message.content;
      return content ? JSON.parse(content) : null;
    }
    return response.choices[0]?.message.content;
  }
}

export default OpenAIAdapter;
