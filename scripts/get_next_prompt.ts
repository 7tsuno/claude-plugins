#!/usr/bin/env npx tsx
/**
 * Get the next prompt from a workflow.
 * Returns only the current step's prompt content (physical isolation).
 */

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_WORKFLOWS_DIR = path.resolve(__dirname, "../../../progressive-prompts");

interface WorkflowStep {
  name: string;
  prompt: string;
}

interface PromptResult {
  step_index: number;
  step_name: string;
  prompt: string;
  total_steps: number;
  is_last: boolean;
}

/**
 * Simple YAML parser for workflow.yaml files.
 */
function parseSimpleYaml(content: string): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  const lines = content.split("\n");

  let currentKey = "";
  let currentArray: Record<string, unknown>[] = [];
  let currentArrayItem: Record<string, unknown> = {};
  let inArray = false;
  let arrayKey = "";

  for (const line of lines) {
    if (!line.trim() || line.trim().startsWith("#")) continue;

    const topLevelMatch = line.match(/^(\w+):\s*(.*)$/);
    if (topLevelMatch) {
      if (inArray && arrayKey) {
        if (Object.keys(currentArrayItem).length > 0) {
          currentArray.push(currentArrayItem);
        }
        result[arrayKey] = currentArray;
        currentArray = [];
        currentArrayItem = {};
        inArray = false;
      }

      const [, key, value] = topLevelMatch;
      if (value.trim()) {
        result[key] = value.replace(/^["']|["']$/g, "").trim();
      } else {
        currentKey = key;
      }
      continue;
    }

    const arrayItemMatch = line.match(/^(\s+)-\s+(\w+):\s*(.*)$/);
    if (arrayItemMatch) {
      const [, , key, value] = arrayItemMatch;
      if (Object.keys(currentArrayItem).length > 0) {
        currentArray.push(currentArrayItem);
      }
      currentArrayItem = {};
      currentArrayItem[key] = value.replace(/^["']|["']$/g, "").trim();
      inArray = true;
      arrayKey = currentKey;
      continue;
    }

    const nestedMatch = line.match(/^(\s+)(\w+):\s*(.*)$/);
    if (nestedMatch && inArray) {
      const [, , key, value] = nestedMatch;
      let parsedValue: string | boolean = value.replace(/^["']|["']$/g, "").trim();
      if (parsedValue === "true") parsedValue = true;
      else if (parsedValue === "false") parsedValue = false;
      currentArrayItem[key] = parsedValue;
    }
  }

  if (inArray && arrayKey) {
    if (Object.keys(currentArrayItem).length > 0) {
      currentArray.push(currentArrayItem);
    }
    result[arrayKey] = currentArray;
  }

  return result;
}

/**
 * Replace {{VAR_NAME}} placeholders with actual values.
 */
function substituteVariables(content: string, variables: Record<string, string>): string {
  return content.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
    return variables[varName] ?? match;
  });
}

function loadWorkflow(workflowId: string, baseDir: string): Record<string, unknown> {
  const workflowFile = path.join(baseDir, workflowId, "workflow.yaml");

  if (!fs.existsSync(workflowFile)) {
    throw new Error(`Workflow not found: ${workflowId}`);
  }

  const content = fs.readFileSync(workflowFile, "utf-8");
  return parseSimpleYaml(content);
}

function getPrompt(
  workflowId: string,
  stepIndex: number,
  variables: Record<string, string> = {},
  baseDir: string = ".claude/progressive-prompts"
): PromptResult {
  const workflow = loadWorkflow(workflowId, baseDir);
  const steps = (workflow.steps as WorkflowStep[]) || [];

  if (steps.length === 0) {
    throw new Error(`Workflow '${workflowId}' has no steps`);
  }

  const totalSteps = steps.length;

  if (stepIndex < 0 || stepIndex >= totalSteps) {
    throw new Error(`Step index ${stepIndex} out of range (0-${totalSteps - 1})`);
  }

  const step = steps[stepIndex];
  const promptPath = path.join(baseDir, workflowId, step.prompt);

  if (!fs.existsSync(promptPath)) {
    throw new Error(`Prompt file not found: ${promptPath}`);
  }

  let promptContent = fs.readFileSync(promptPath, "utf-8");
  promptContent = substituteVariables(promptContent, variables);

  return {
    step_index: stepIndex,
    step_name: step.name || `step_${stepIndex}`,
    prompt: promptContent,
    total_steps: totalSteps,
    is_last: stepIndex === totalSteps - 1,
  };
}

// Main
function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.error("Usage: get_next_prompt.ts <workflow_id> <step_index> [variables_json] [base_dir]");
    console.error('Example: get_next_prompt.ts review 0 \'{"PR_NUMBER": "123"}\'');
    process.exit(1);
  }

  const workflowId = args[0];
  const stepIndex = parseInt(args[1], 10);
  const variables = args[2] ? JSON.parse(args[2]) : {};
  const baseDir = args[3] || DEFAULT_WORKFLOWS_DIR;

  try {
    const result = getPrompt(workflowId, stepIndex, variables, baseDir);
    console.log(JSON.stringify(result, null, 2));
  } catch (e) {
    console.error(JSON.stringify({ error: (e as Error).message }));
    process.exit(1);
  }
}

main();
