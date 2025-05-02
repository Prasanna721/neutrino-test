import {
  BaseMessageFields,
  HumanMessage,
  MessageContent,
  SystemMessage,
} from "@langchain/core/messages";
import { VAR_JSON } from "../constants.js";

export const claudeAction = (data: any) => {
  const prompt = `
        I am showing you a screenshot of a webpage along with the following task: "${
          data.task
        }"
        
        Screen dimensions:
        ${JSON.stringify(data.screen_dimensions, null, 2)}
        
        Based on the screenshot and dimensions, please provide instructions for completing this task. The task wouldn't be direct, you have to look at the elements present on the screen and understand the task and provide instructions to execute the task.
        Return your response in this exact JSON format:
        {
            "task_type": "goto_page|click|type|hover|drag|sleep|scroll",
            "message": "specific message or URL",
            "screen_coord": {"x": number, "y": number} or null
            "scroll": {"isVertical": boolean, "px": number} optional
        }
        on scroll task_type, screen_coord is location of mouse pointer and scroll is object it tells the direction and amount of scroll in pixels.
        OUTPUT JSON ONLY FOR MACHINE PARSING (STRICTLY JSON)
        
        The screenshot is provided as base64. Analyze it and provide precise coordinates for any interactions.
        split the task into multiple steps if necessary and execute each step in order.
    `;

  return {
    type: VAR_JSON,
    prompt: prompt,
  };
};

export const formatPreviousAction = (data: {}) => {
  return `<previous_action>${data}</previous_action>`;
};

export const formatNextStep = (data: string) => {
  return `<next_test_step>${data}</next_test_step>`;
};

export const claudeVerifyAction = (data: any) => {
  const prompt = `
        Given the previous_view (webpage before action) and current_view (webpage after action), alongside the task and action performed, verify whether if the task was successfully completed. Carefully compare previous_view and current_view—even for minor or subtle differences such as small icons, text updates, map markers, or other UI elements and determine if the intended task were completed and the result is reflected in the current view.
        Task:
        ${data.task}

        The previous_view and current_view is provided as base64, check whether the required task is executed.

        Return your response in this exact JSON format:
        {
            "status": "success | failure | partial",
            "message": "<Detailed explanation of the verification result>"
        }

        OUTPUT JSON ONLY FOR MACHINE PARSING 
    `;

  return {
    type: VAR_JSON,
    prompt: prompt,
  };
};

export const getTestflowPrompt = (
  data: any
): {
  system_content: MessageContent;
  user_content: string;
} => {
  const systemPrompt = `
    You are an AI assistant tasked with generating visual steps and action steps for a given test step in a user interface testing scenario. Your goal is to break down the test step into a series of visual checks and corresponding actions that can be performed to validate and execute the test.

    If the test_step is a go to task, then you should just initiate goto_page action

    Here's the process you'll follow:
    1. Analyze the given test step
    2. Generate visual steps (checks to be performed visually)
    3. Generate action steps (actions to be taken based on visual checks)
    4. Provide a complete set of steps for executing the test

    For each test step, you will generate two types of steps:

    1. visualSteps: A list of visual checks to be performed, each prefixed with []. These checks should be specific and verifiable by looking at the user interface.

    2. actionSteps: A list of actions to be taken based on the visual checks, each prefixed with []. These actions should be specific and executable.

    When generating visualSteps:
    - Start with basic UI element checks (e.g., presence of a list, button, dropdown)
    - Progress to more specific checks related to the test step
    - Include checks for expected content or state changes [for which user needs to interact]
    - Use clear and concise language

    When generating actionSteps:
    - Correspond each action to a visual check where applicable
    - Include scrolling or navigation actions if needed
    - Specify exact interactions (e.g., click, type, scroll, hover, drag)
    - Include verification actions where necessary

    As you generate steps, consider the following:
    - If a visual check fails, provide an appropriate error message or alternative action
    - If a list or set of elements is involved, include steps to scroll or navigate through all items
    - Add additional visual checks and actions as needed to fully complete the test step

    If the test involves a list or set of elements that may extend beyond the visible area:
    - Add a final visual check to determine if there are more items
    - If more items exist, add actions to scroll or navigate, and repeat relevant checks

    Important actionStep Notes to follow:
    -  If adding a action_step for input elements like search bars or text boxes, combine the click and type in the same actionStep

    Output your response in the following format:
    <test_step_analysis>
    [test_step-"quote test step"][Your analysis of the given test step]
    </test_step_analysis>

    <visual_steps>
    [] [First visual check]
    [] [Second visual check]
    ...
    </visual_steps>

    <action_steps>
    [] [First action]
    [] [Second action]
    ...
    </action_steps>

    <execution_notes>
    [Any additional notes on executing the steps or handling specific scenarios]
    </execution_notes>
  `;
  const userPrompt = `
    Now, analyze the following test step and generate the appropriate visual steps and action steps:

    <test_step>
      ${data.TEST_STEP}
    </test_step>
  `;
  return {
    system_content: [
      {
        type: "text",
        text: systemPrompt,
        cache_control: { type: "ephemeral" },
      },
    ],
    user_content: userPrompt,
  };
};

export const getProcessTestStepPrompt = (
  data: any
): { system_content: MessageContent; user_content: string } => {
  const systemPrompt = `
    You are an AI assistant specialized in analyzing web interfaces and providing step-by-step instructions for interacting with them. Your task is to verify visual elements and provide precise actions for navigating and interacting with a given interface.

    First, review the following test step analysis.
    and, you will be presented with visual steps, action steps, and execution notes. These will guide your analysis of the screenshot.

    Your task is to check each visual step consecutively against the provided screenshot. As you confirm or complete each step, replace the '[]' with '[x]' in your response. After verifying the visual steps, you will provide action steps one at a time.

    When I provide you with the screenshot, carefully analyze it and compare it to the visual steps. Confirm or update each step based on what you observe in the image.

    For each action step, return the information in the following format:

    <visual_steps>
    [List each visual step, marked with [x] if confirmed or updated [x] based on your observation]
    </visual_steps>

    <action_steps>
    [List each action step, marked with [x] if confirmed or updated [x] based on your observation]
    </action_steps>

    <action>
    {
        "task_type": "goto_page|click|type|hover|drag|sleep|scroll",
        "message": "specific message or URL",
        "screen_coord": {"x": number, "y": number} or null,
        "scroll": {"isVertical": boolean, "px": number} (optional)
    }
    </action>

    <test_step_response>
    {
        "status": "complete|partial|failed",
        "message": "status message"
    }
    </test_step_response>

    <error>
    {
        "err_type": "short description of the bug",
        "description": "detailed description of the bug"
    }
    </error>

    Provide only one action step at a time. The <action> and <error> tags can be empty if not applicable.
    `;

  const userPrompt = `
    <test_step_analysis>
      ${data.TEST_STEP_ANALYSIS}
    </test_step_analysis>
    <screen_dimensions>
      ${JSON.stringify(data.SCREEN_DIMENSIONS, null, 2)}
    </screen_dimensions>
    <visual_steps>
      ${data.VISUAL_STEPS}
    </visual_steps>
    <action_steps>
      ${data.ACTION_STEPS}
    </action_steps>
    <execution_notes>
      ${data.EXECUTION_NOTES}
    </execution_notes>
  `;

  return {
    system_content: [
      {
        type: "text",
        text: systemPrompt,
        cache_control: { type: "ephemeral" },
      },
    ],
    user_content: userPrompt,
  };
};

export const getProcessTestStepPromptV2 = (
  data: any
): { system_content: MessageContent; user_content: string } => {
  const systemPrompt = `
    You are an AI assistant specialized in analyzing web interfaces and providing step-by-step instructions for interacting with them. Your task is to verify visual elements and provide precise actions for navigating and interacting with a given interface based on screenshots.

    you will be given test_step_analysis, visual_steps, action_steps, execution_notes along with the screenshot.

    Response Format:
    Use the following structure for your response:

    <visual_steps>
    [List each visual step, marked with [x] if confirmed or updated based on your observation]
    </visual_steps>

    <action_steps>
    [List each action step, marked with [x] if it has been executed in previous iterations]
    </action_steps>

    <action>
    {
        "task_type": "goto_page|click|click_and_type|type|hover|drag|sleep|scroll",
        "message": "specific message or URL",
        "screen_coord": {"x": number, "y": number} or null,
        "scroll": {"isVertical": boolean, "px": number} (optional),
        "init_screen_coord": {"x": number, "y": number} only for drag action,
    }
    </action>

    <test_step_response>
    {
        "status": "complete|partial|failed",
        "message": "status message"
    }
    </test_step_response>

    <error>
    {
        "err_type": "short description of the bug prevent executing action_step",
        "description": "detailed description of the bug"
    }
    </error>

    Action task_type Info:
      - goto_page: performs page.goto(url)
      - click_and_type | type: performs page.mouse.click(coords) & page.keyboard.type(message)
      - click: performs page.mouse.click(coords)
      - hover: performs page.mouse.move(coords)
      - drag: performs page.mouse.down() & page.mouse.move(coords) & page.mouse.up()
      - sleep: performs page.waitForTimeout(ms) ~5secs
      - scroll: performs page.mouse.move(coords) & page.mouse.wheel(x, y) for vertical or horizontal scroll

    Additional Info:
      - For goto action might have an blank screenshot
      - For drag action, there should be two screen coordinates init_screen_coord and screen_coord

    Important Notes:
      - Provide only one action step at a time.
      - The <action> and <error> tags can be empty if not applicable.
      - Always mark the previously executed or confirmed action step with [x] in the <action_steps> section.
      - Understand the actions and mark the output action step with [x] in the <action_steps> section.
      - Base your analysis and actions on the most recent screenshot provided.
      - Error tag should be used only if there is a bug which prevents you from completing the task.

    Action Tips:
      - If the action_step has click and type, you can action task_type "type" because it performs mouse.click and keyboard.type

    Please proceed with your analysis and provide the next action step based on the given information and the attached screenshot(s).
  `;

  const userPrompt = `
  Here's the information you'll be working with:

    <test_step_analysis>
      ${data.TEST_STEP_ANALYSIS}
    </test_step_analysis>
    <screen_dimensions>
      ${JSON.stringify(data.SCREEN_DIMENSIONS, null, 2)}
    </screen_dimensions>
    <visual_steps>
      ${data.VISUAL_STEPS}
    </visual_steps>
    <action_steps>
      ${data.ACTION_STEPS}
    </action_steps>
    <execution_notes>
      ${data.EXECUTION_NOTES}
    </execution_notes>

  Instructions:
    1. Review the visual steps, action steps, execution notes, and test step analysis provided above.
    2. Analyze the attached screenshot carefully.
    3. Compare the visual steps with the screenshot, confirming or updating each step based on your observations.
    4. Provide the next action step that hasn't been executed yet.
    5. Format your response according to the structure specified below.

  Given the previous_view (webpage before action) and current_view (webpage after action), alongside the task and action performed, verify whether if the task was successfully completed. Carefully compare previous_view and current_view—even for minor or subtle differences such as small icons, text updates, map markers, or other UI elements and determine if the intended task were completed and the result is reflected in the current view and update action step with [x] in <action_steps> section.
  `;

  return {
    system_content: [
      {
        type: "text",
        text: systemPrompt,
        cache_control: { type: "ephemeral" },
      },
    ],
    user_content: userPrompt,
  };
};
