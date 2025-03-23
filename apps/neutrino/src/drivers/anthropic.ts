/**
 * Adapter for Anthropic API with vision support.
 */

import * as dotenv from "dotenv";
import { promises as fs } from "fs";
import Anthropic from "@anthropic-ai/sdk";
import {
  ImageBlockParam,
  TextBlock,
} from "@anthropic-ai/sdk/resources/index.mjs";
import { AnthropicInput, ChatAnthropic } from "@langchain/anthropic";
import {
  BaseMessageFields,
  HumanMessage,
  MessageContent,
  SystemMessage,
} from "@langchain/core/messages";

dotenv.config();

const MAX_TOKENS = 4096;
const MAX_IMAGES = 20;
export enum ANTHROPIC_MODEL {
  sonnet = "claude-3-5-sonnet-20241022",
  opus = "claude-3-opus-latest",
}

class AnthropicAdapter {
  private anthropic: Anthropic;
  messages: Array<Anthropic.MessageParam> = [];

  constructor() {
    this.anthropic = new Anthropic({
      apiKey: process.env.CLAUDE_API_KEY,
    });
  }

  async constructPayload(
    prompt?: string | null,
    images?: string[] | null,
    system_prompt?: string | null
  ): Promise<Array<Anthropic.MessageParam>> {
    const message_content: Array<TextBlock | ImageBlockParam> = [];
    if (system_prompt) {
      this.messages.push({
        role: "assistant",
        content: system_prompt,
      });
    }
    if (prompt) {
      message_content.push({
        type: "text",
        text: prompt,
        citations: [],
      });
    }
    if (images) {
      for (const image_path of images) {
        const image = await fs.readFile(image_path);
        const image_base64_data = image.toString("base64");
        const media_type = "image/png";
        message_content.push({
          type: "image",
          source: {
            type: "base64",
            media_type: media_type,
            data: image_base64_data,
          },
        });
      }
    }
    if (message_content.length > 0) {
      this.messages.push({
        role: "user",
        content: message_content,
      });
    }
    return this.messages;
  }

  async generateResponse(
    json: boolean = false,
    model = ANTHROPIC_MODEL.sonnet,
    max_tokens = MAX_TOKENS
  ) {
    const response = await this.anthropic.messages.create({
      model: model,
      max_tokens: max_tokens,
      messages: this.messages,
    });

    if (response.content[0]?.type === "text") {
      if (json) {
        return JSON.parse(response.content[0].text);
      }

      return (response.content[0] as TextBlock).text;
    }
  }

  static async getModel(
    model: ANTHROPIC_MODEL,
    cacheEnabled?: boolean
  ): Promise<ChatAnthropic> {
    let modelConfig: Partial<AnthropicInput> = {
      apiKey: process.env.CLAUDE_API_KEY,
      model: model,
    };
    if (cacheEnabled) {
      modelConfig["clientOptions"] = {
        defaultHeaders: {
          "anthropic-beta": "prompt-caching-2024-07-31",
        },
      };
    }
    return new ChatAnthropic(modelConfig);
  }

  static async constructPayload(
    prompt?: string | null,
    images?: string[] | null,
    system_prompt?: MessageContent
  ): Promise<any> {
    let system_content: SystemMessage | null = null;
    let user_content: HumanMessage | null = null;
    const message_content: any = [];
    const res: any = [];

    if (system_prompt) {
      system_content = new SystemMessage({ content: system_prompt });
      res.push(system_content);
    }
    if (prompt) {
      message_content.push({
        type: "text",
        text: prompt,
        citations: [],
      });
    }
    if (images) {
      for (const image_path of images) {
        const image = await fs.readFile(image_path);
        const image_base64_data = image.toString("base64");
        message_content.push({
          type: "image_url",
          image_url: { url: "data:image/png;base64," + image_base64_data },
        });
      }
    }
    if (message_content.length > 0) {
      user_content = new HumanMessage({ content: message_content });
      res.push(user_content);
    }
    return res;
  }
}

export default AnthropicAdapter;
