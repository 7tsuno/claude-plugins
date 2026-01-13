#!/usr/bin/env node
/**
 * Get workflow catalog from workflows directory.
 * Returns only id, name, description (not args).
 */

import * as fs from "fs";
import * as path from "path";
import { getWorkflowsDir } from "./config.js";

export interface WorkflowCatalogEntry {
  id: string;
  name: string;
  description: string;
}

/**
 * Simple YAML parser for workflow.yaml files (top-level only).
 */
export function parseSimpleYaml(content: string): Record<string, string> {
  const result: Record<string, string> = {};
  const lines = content.split("\n");

  for (const line of lines) {
    if (!line.trim() || line.trim().startsWith("#")) continue;

    // Only parse top-level key: value (not arrays or nested)
    const match = line.match(/^(\w+):\s*["']?([^"'\n]+)["']?\s*$/);
    if (match) {
      const [, key, value] = match;
      result[key] = value.trim();
    }
  }

  return result;
}

export function getWorkflowCatalog(baseDir: string = "progressive-prompts"): WorkflowCatalogEntry[] {
  const catalog: WorkflowCatalogEntry[] = [];

  if (!fs.existsSync(baseDir)) {
    return catalog;
  }

  const entries = fs.readdirSync(baseDir, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const workflowFile = path.join(baseDir, entry.name, "workflow.yaml");
    if (!fs.existsSync(workflowFile)) continue;

    try {
      const content = fs.readFileSync(workflowFile, "utf-8");
      const data = parseSimpleYaml(content);

      catalog.push({
        id: entry.name,
        name: data.name || entry.name,
        description: data.description || "",
      });
    } catch (e) {
      console.error(`Warning: Failed to parse ${workflowFile}: ${e}`);
    }
  }

  return catalog;
}

// CLI entry point
function main() {
  const baseDir = process.argv[2] || getWorkflowsDir();

  if (!fs.existsSync(baseDir)) {
    console.error(JSON.stringify({
      error: `Workflows directory not found: ${baseDir}`,
      hint: `Please create the directory '${baseDir}' and add workflow definitions.`
    }));
    process.exit(1);
  }

  const catalog = getWorkflowCatalog(baseDir);
  console.log(JSON.stringify(catalog, null, 2));
}

// Run main only when executed directly (not imported)
const isDirectRun = process.argv[1]?.endsWith("get_workflow_catalog.js") ||
                    process.argv[1]?.endsWith("get_workflow_catalog.ts");
if (isDirectRun) {
  main();
}
