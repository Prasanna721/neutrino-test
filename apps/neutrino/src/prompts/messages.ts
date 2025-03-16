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
