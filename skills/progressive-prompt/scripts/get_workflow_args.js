#!/usr/bin/env node
/**
 * Get args definition for a specific workflow.
 */
import * as fs from "fs";
import * as path from "path";
// Default to project root's progressive-prompts directory
const DEFAULT_WORKFLOWS_DIR = path.resolve(process.cwd(), "workflows");
/**
 * Simple YAML parser for args section.
 */
export function parseArgsFromYaml(content) {
    const args = [];
    const lines = content.split("\n");
    let inArgs = false;
    let currentArg = null;
    let sectionEnded = false;
    for (const line of lines) {
        if (!line.trim() || line.trim().startsWith("#"))
            continue;
        // Detect args: section start
        if (line.match(/^args:\s*$/)) {
            inArgs = true;
            continue;
        }
        // Detect end of args section (new top-level key)
        if (inArgs && line.match(/^[a-z]+:/)) {
            if (currentArg?.name)
                args.push(currentArg);
            sectionEnded = true;
            break;
        }
        if (!inArgs)
            continue;
        // Array item start (line with "- ")
        if (line.match(/^\s+-\s+/)) {
            if (currentArg?.name)
                args.push(currentArg);
            currentArg = { required: false };
            const match = line.match(/^\s+-\s+(\w+):\s*["']?([^"'\n]*)["']?\s*$/);
            if (match) {
                const [, key, value] = match;
                if (key === "name")
                    currentArg.name = value.trim();
                else if (key === "description")
                    currentArg.description = value.trim();
                else if (key === "required")
                    currentArg.required = value.trim() === "true";
            }
            continue;
        }
        // Nested property (no "- ")
        if (currentArg) {
            const match = line.match(/^\s+(\w+):\s*["']?([^"'\n]*)["']?\s*$/);
            if (match) {
                const [, key, value] = match;
                if (key === "name")
                    currentArg.name = value.trim();
                else if (key === "description")
                    currentArg.description = value.trim();
                else if (key === "required")
                    currentArg.required = value.trim() === "true";
            }
        }
    }
    // Push last arg only if section didn't end with a new key
    if (!sectionEnded && currentArg?.name) {
        args.push(currentArg);
    }
    return args;
}
export function getWorkflowArgs(workflowId, baseDir = "progressive-prompts") {
    const workflowFile = path.join(baseDir, workflowId, "workflow.yaml");
    if (!fs.existsSync(workflowFile)) {
        throw new Error(`Workflow not found: ${workflowId}`);
    }
    const content = fs.readFileSync(workflowFile, "utf-8");
    return parseArgsFromYaml(content);
}
// CLI entry point
function main() {
    const workflowId = process.argv[2];
    const baseDir = process.argv[3] || DEFAULT_WORKFLOWS_DIR;
    if (!workflowId) {
        console.error("Usage: get_workflow_args.js <workflow_id> [base_dir]");
        process.exit(1);
    }
    try {
        const args = getWorkflowArgs(workflowId, baseDir);
        console.log(JSON.stringify(args, null, 2));
    }
    catch (e) {
        console.error(JSON.stringify({ error: e.message }));
        process.exit(1);
    }
}
// Run main only when executed directly (not imported)
const isDirectRun = process.argv[1]?.endsWith("get_workflow_args.js") ||
    process.argv[1]?.endsWith("get_workflow_args.ts");
if (isDirectRun) {
    main();
}
