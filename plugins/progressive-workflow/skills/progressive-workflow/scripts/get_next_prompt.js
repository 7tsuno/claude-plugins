#!/usr/bin/env node
/**
 * Get the next prompt from a workflow.
 * Returns only the current step's prompt content (physical isolation).
 */
import * as fs from "fs";
import * as path from "path";
import { getWorkflowsDir } from "./config.js";
/**
 * Simple YAML parser for workflow.yaml files.
 */
export function parseWorkflowYaml(content) {
    const result = {};
    const lines = content.split("\n");
    let currentKey = "";
    let currentArray = [];
    let currentArrayItem = {};
    let inArray = false;
    let arrayKey = "";
    for (const line of lines) {
        if (!line.trim() || line.trim().startsWith("#"))
            continue;
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
            }
            else {
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
            let parsedValue = value.replace(/^["']|["']$/g, "").trim();
            if (parsedValue === "true")
                parsedValue = true;
            else if (parsedValue === "false")
                parsedValue = false;
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
export function substituteVariables(content, variables) {
    return content.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
        return variables[varName] ?? match;
    });
}
export function loadWorkflow(workflowId, baseDir) {
    const workflowFile = path.join(baseDir, workflowId, "workflow.yaml");
    if (!fs.existsSync(workflowFile)) {
        throw new Error(`Workflow not found: ${workflowId}`);
    }
    const content = fs.readFileSync(workflowFile, "utf-8");
    return parseWorkflowYaml(content);
}
export function getPrompt(workflowId, stepIndex, variables = {}, baseDir = "progressive-prompts") {
    const workflow = loadWorkflow(workflowId, baseDir);
    const steps = workflow.steps || [];
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
// CLI entry point
function main() {
    const args = process.argv.slice(2);
    if (args.length < 2) {
        console.error("Usage: get_next_prompt.js <workflow_id> <step_index> [variables_json] [base_dir]");
        console.error('Example: get_next_prompt.js review 0 \'{"PR_NUMBER": "123"}\'');
        process.exit(1);
    }
    const workflowId = args[0];
    const stepIndex = parseInt(args[1], 10);
    const variables = args[2] ? JSON.parse(args[2]) : {};
    const baseDir = args[3] || getWorkflowsDir();
    try {
        const result = getPrompt(workflowId, stepIndex, variables, baseDir);
        console.log(JSON.stringify(result, null, 2));
    }
    catch (e) {
        console.error(JSON.stringify({ error: e.message }));
        process.exit(1);
    }
}
// Run main only when executed directly (not imported)
const isDirectRun = process.argv[1]?.endsWith("get_next_prompt.js") ||
    process.argv[1]?.endsWith("get_next_prompt.ts");
if (isDirectRun) {
    main();
}
