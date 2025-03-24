import { Page } from "playwright";

export const improveBrowserVisibility = async (page: Page) => {
  await page.addStyleTag({
    content: `
      input:focus, 
      textarea:focus {
      -webkit-animation: none !important;
        animation: none !important;
        caret-color: black !important;
      }
    `,
  });
};
