import { BROWSER_ACTIONS, VERIFYACTION_STATUS } from "./types/enums.js";
import { Page } from "playwright";

export interface Action {
  task_type: BROWSER_ACTIONS;
  message?: string;
  screen_coord?: { x: number; y: number };
  scroll?: { isVertical: boolean; px: number };
}

export interface VerifyAction {
  status: VERIFYACTION_STATUS;
  message: string;
}

export async function executeAction(page: Page, action: Action): Promise<void> {
  switch (action.task_type) {
    case BROWSER_ACTIONS.goto_page:
      if (action.message) {
        await page.goto(action.message);
      }
      break;
    case BROWSER_ACTIONS.click:
      if (action.screen_coord) {
        await page.mouse.click(action.screen_coord.x, action.screen_coord.y);
      }
      break;
    case BROWSER_ACTIONS.type:
    case BROWSER_ACTIONS.click_and_type:
      if (action.screen_coord && action.message) {
        await page.mouse.click(action.screen_coord.x, action.screen_coord.y);
        await page.keyboard.type(action.message);
      }
      break;
    case BROWSER_ACTIONS.hover:
      if (action.screen_coord) {
        await page.mouse.move(action.screen_coord.x, action.screen_coord.y);
      }
      break;
    case BROWSER_ACTIONS.drag:
      if (action.screen_coord) {
        await page.mouse.down();
        await page.mouse.move(action.screen_coord.x, action.screen_coord.y);
        await page.mouse.up();
      }
      break;
    case BROWSER_ACTIONS.sleep:
      await page.waitForTimeout(5000);
      break;
    case BROWSER_ACTIONS.scroll:
      if (action.screen_coord && action.scroll) {
        await page.mouse.move(action.screen_coord.x, action.screen_coord.y);
        if (action.scroll.isVertical) {
          await page.mouse.wheel(0, action.scroll.px);
        } else {
          await page.mouse.wheel(action.scroll.px, 0);
        }
      }
      break;
  }
}
