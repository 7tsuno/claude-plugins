import { describe, it, expect, beforeAll, afterAll } from "vitest";
import * as path from "path";
import * as fs from "fs";
import { fileURLToPath } from "url";

import {
  parseWorkflowYaml,
  substituteVariables,
  getPrompt,
} from "../src/get_next_prompt.js";

import {
  parseArgsFromYaml,
  getWorkflowArgs,
} from "../src/get_workflow_args.js";

import {
  parseSimpleYaml,
  getWorkflowCatalog,
} from "../src/get_workflow_catalog.js";

import {
  loadConfig,
  getWorkflowsDir,
} from "../src/config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FIXTURES_DIR = path.join(__dirname, "fixtures");

describe("parseWorkflowYaml", () => {
  it("should parse top-level string values", () => {
    const yaml = `name: Test Workflow
description: A test workflow`;
    const result = parseWorkflowYaml(yaml);
    expect(result.name).toBe("Test Workflow");
    expect(result.description).toBe("A test workflow");
  });

  it("should parse steps array", () => {
    const yaml = `name: Test
steps:
  - name: step1
    prompt: prompts/step1.md
  - name: step2
    prompt: prompts/step2.md`;
    const result = parseWorkflowYaml(yaml);
    expect(result.steps).toHaveLength(2);
    expect((result.steps as Array<{ name: string }>)[0].name).toBe("step1");
    expect((result.steps as Array<{ name: string }>)[1].name).toBe("step2");
  });

  it("should ignore comments and empty lines", () => {
    const yaml = `# This is a comment
name: Test

# Another comment
description: Description`;
    const result = parseWorkflowYaml(yaml);
    expect(result.name).toBe("Test");
    expect(result.description).toBe("Description");
  });
});

describe("substituteVariables", () => {
  it("should replace single variable", () => {
    const result = substituteVariables("Hello {{NAME}}!", { NAME: "World" });
    expect(result).toBe("Hello World!");
  });

  it("should replace multiple variables", () => {
    const result = substituteVariables("{{A}} and {{B}}", { A: "One", B: "Two" });
    expect(result).toBe("One and Two");
  });

  it("should keep unmatched variables", () => {
    const result = substituteVariables("{{KNOWN}} and {{UNKNOWN}}", { KNOWN: "Yes" });
    expect(result).toBe("Yes and {{UNKNOWN}}");
  });
});

describe("parseArgsFromYaml", () => {
  it("should parse args section", () => {
    const yaml = `name: Test
args:
  - name: TARGET
    description: Target path
    required: true
  - name: FLAG
    description: Optional flag
    required: false
steps:
  - name: step1
    prompt: step1.md`;
    const args = parseArgsFromYaml(yaml);
    expect(args).toHaveLength(2);
    expect(args[0]).toEqual({
      name: "TARGET",
      description: "Target path",
      required: true,
    });
    expect(args[1]).toEqual({
      name: "FLAG",
      description: "Optional flag",
      required: false,
    });
  });

  it("should return empty array if no args section", () => {
    const yaml = `name: Test
steps:
  - name: step1
    prompt: step1.md`;
    const args = parseArgsFromYaml(yaml);
    expect(args).toEqual([]);
  });
});

describe("parseSimpleYaml", () => {
  it("should parse top-level key-value pairs only", () => {
    const yaml = `name: Test Workflow
description: A description
steps:
  - name: step1`;
    const result = parseSimpleYaml(yaml);
    expect(result.name).toBe("Test Workflow");
    expect(result.description).toBe("A description");
    expect(result.steps).toBeUndefined();
  });
});

describe("getPrompt", () => {
  it("should return prompt for step 0", () => {
    const result = getPrompt("sample-workflow", 0, { TARGET_FILE: "test.ts" }, FIXTURES_DIR);
    expect(result.step_index).toBe(0);
    expect(result.step_name).toBe("step1");
    expect(result.total_steps).toBe(2);
    expect(result.is_last).toBe(false);
    expect(result.prompt).toContain("step 1 for test.ts");
  });

  it("should return prompt for last step", () => {
    const result = getPrompt("sample-workflow", 1, { OPTIONAL_FLAG: "enabled" }, FIXTURES_DIR);
    expect(result.step_index).toBe(1);
    expect(result.step_name).toBe("step2");
    expect(result.is_last).toBe(true);
    expect(result.prompt).toContain("optional flag: enabled");
  });

  it("should throw for invalid step index", () => {
    expect(() => getPrompt("sample-workflow", 99, {}, FIXTURES_DIR)).toThrow(
      "Step index 99 out of range"
    );
  });

  it("should throw for non-existent workflow", () => {
    expect(() => getPrompt("non-existent", 0, {}, FIXTURES_DIR)).toThrow(
      "Workflow not found"
    );
  });
});

describe("getWorkflowArgs", () => {
  it("should return args for workflow", () => {
    const args = getWorkflowArgs("sample-workflow", FIXTURES_DIR);
    expect(args).toHaveLength(2);
    expect(args[0].name).toBe("TARGET_FILE");
    expect(args[0].required).toBe(true);
    expect(args[1].name).toBe("OPTIONAL_FLAG");
    expect(args[1].required).toBe(false);
  });
});

describe("getWorkflowCatalog", () => {
  it("should return catalog of workflows", () => {
    const catalog = getWorkflowCatalog(FIXTURES_DIR);
    expect(catalog).toHaveLength(1);
    expect(catalog[0].id).toBe("sample-workflow");
    expect(catalog[0].name).toBe("Sample Workflow");
    expect(catalog[0].description).toBe("A sample workflow for testing");
  });

  it("should return empty array for non-existent directory", () => {
    const catalog = getWorkflowCatalog("/non/existent/path");
    expect(catalog).toEqual([]);
  });
});

describe("loadConfig", () => {
  const testDir = path.join(__dirname, "fixtures", "config-test");
  const configPath = path.join(testDir, ".progressive-workflow.json");

  beforeAll(() => {
    fs.mkdirSync(testDir, { recursive: true });
  });

  afterAll(() => {
    if (fs.existsSync(configPath)) {
      fs.unlinkSync(configPath);
    }
    fs.rmdirSync(testDir);
  });

  it("should return default config when no config file exists", () => {
    const config = loadConfig(testDir);
    expect(config.workflowsDir).toBe("workflows");
  });

  it("should load custom workflowsDir from config file", () => {
    fs.writeFileSync(configPath, JSON.stringify({ workflowsDir: ".claude/workflows" }));
    const config = loadConfig(testDir);
    expect(config.workflowsDir).toBe(".claude/workflows");
    fs.unlinkSync(configPath);
  });

  it("should merge with defaults for partial config", () => {
    fs.writeFileSync(configPath, JSON.stringify({}));
    const config = loadConfig(testDir);
    expect(config.workflowsDir).toBe("workflows");
    fs.unlinkSync(configPath);
  });
});

describe("getWorkflowsDir", () => {
  it("should return absolute path to workflows directory", () => {
    const dir = getWorkflowsDir(FIXTURES_DIR);
    expect(path.isAbsolute(dir)).toBe(true);
    expect(dir).toContain("workflows");
  });
});
