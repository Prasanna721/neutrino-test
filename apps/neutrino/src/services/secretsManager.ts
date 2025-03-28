import { SupabaseDB } from "@neutrino-package/supabase";
import { Pod } from "@neutrino-package/supabase/types";
import { PodLogHandler } from "./dbHandler.js";

/**
 * SecretsManager handles config and credential replacement.
 * It provides methods to update the available configs,
 * process test steps to generate (or substitute) secret values,
 * and process actions to replace secret placeholders with real values.
 */
export class SecretsManager {
  public secretMapping: Record<string, string> = {};
  public testsuiteConfigs: Record<string, string> = {};
  private configPattern = /\/\[config\]([\w_]+)/g;

  constructor() {}

  async updateConfigs(
    testSuiteId: string,
    db: SupabaseDB,
    podId: number,
    testSuite: string[] | null,
    podLogHandler: PodLogHandler
  ): Promise<void> {
    const testsuiteConfigs = await db.getTestsuiteConfigs(testSuiteId);
    for (const config of testsuiteConfigs) {
      this.testsuiteConfigs[config.key] = config.value;
    }

    const missingConfigs: string[] = [];

    for (const testStep of testSuite || []) {
      const { generatedConfigs } = this.processTestStep(testStep);
      for (const key in generatedConfigs) {
        if (key && !this.testsuiteConfigs[key]) {
          missingConfigs.push(key);
        }
      }
    }

    if (missingConfigs.length > 0) {
      await podLogHandler.error(podId, "missing_configs", {
        missingConfigs,
      });
      throw new Error(
        `Missing testsuite configs: [${missingConfigs.join(", ")}]`
      );
    }

    await podLogHandler.info(podId, "Fetched testsuite configs");
    await db.updatePod(podId, {
      testsuite_configs: Object.keys(this.secretMapping),
    });

    throw new Error("Missing testsuite configs");

    console.log("Fetched testsuite configs");
  }

  processTestStep(testStep: string): {
    processedStep: string;
    generatedConfigs: Record<string, string>;
  } {
    let match;
    let processedStep = testStep;
    const generatedConfigs: Record<string, string> = {};

    while ((match = this.configPattern.exec(testStep)) !== null) {
      const key = match[1];
      if (key) {
        if (!this.secretMapping[key]) {
          const secretValue = `<${key}>`;
          this.secretMapping[key] = secretValue;
        }
        generatedConfigs[key] = this.secretMapping[key];
        processedStep = processedStep.replace(
          new RegExp(`\/\\[config\\]${key}`, "g"),
          this.secretMapping[key]
        );
      }
    }
    return { processedStep, generatedConfigs };
  }

  async processAction(
    testStep: string,
    action: any
  ): Promise<{
    actionWithRealConfigs: any;
    actionWithPlaceholder: any;
  }> {
    const actionWithRealConfigs = JSON.parse(JSON.stringify(action));
    const actionWithPlaceholder = JSON.parse(JSON.stringify(action));

    const usedKeysSet = new Set<string>();
    const matches = testStep.matchAll(this.configPattern);
    for (const m of matches) {
      if (m[1]) {
        usedKeysSet.add(m[1]);
      }
    }
    const usedKeys = Array.from(usedKeysSet);

    function replacePlaceholders(
      obj: any,
      testsuiteConfigs: Record<string, string>,
      usedKeys: string[]
    ): any {
      if (typeof obj === "string") {
        usedKeys.forEach((key) => {
          if (testsuiteConfigs[key]) {
            obj = obj.replace(
              new RegExp(`<${key}>`, "g"),
              testsuiteConfigs[key]
            );
          }
        });
        return obj;
      } else if (typeof obj === "object" && obj !== null) {
        for (const k in obj) {
          obj[k] = replacePlaceholders(obj[k], testsuiteConfigs, usedKeys);
        }
        return obj;
      } else {
        return obj;
      }
    }

    function revertToPlaceholders(
      obj: any,
      secretMapping: Record<string, string>,
      usedKeys: string[]
    ): any {
      if (typeof obj === "string") {
        usedKeys.forEach((key) => {
          const generated = secretMapping[key];
          if (generated) {
            obj = obj.replace(new RegExp(generated, "g"), `/[config]${key}`);
          }
        });
        return obj;
      } else if (typeof obj === "object" && obj !== null) {
        for (const k in obj) {
          obj[k] = revertToPlaceholders(obj[k], secretMapping, usedKeys);
        }
        return obj;
      } else {
        return obj;
      }
    }

    const newActionWithRealConfigs = replacePlaceholders(
      actionWithRealConfigs,
      this.testsuiteConfigs,
      usedKeys
    );
    const newActionWithPlaceholder = revertToPlaceholders(
      actionWithPlaceholder,
      this.secretMapping,
      usedKeys
    );

    return {
      actionWithRealConfigs: newActionWithRealConfigs,
      actionWithPlaceholder: newActionWithPlaceholder,
    };
  }
}
