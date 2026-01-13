#!/usr/bin/env npx tsx
/**
 * Get workflow catalog from .claude/progressive-prompts/ directory.
 * Returns only id, name, description (not args).
 */

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_WORKFLOWS_DIR = path.resolve(__dirname, "../../../progressive-prompts");

interface WorkflowCatalogEntry {
  id: string;
  name: string;
  description: string;
}

/**
 * Simple YAML parser for workflow.yaml files.
 */
function parseSimpleYaml(content: string): Record<string, string> {
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

function getWorkflowCatalog(baseDir: string = ".claude/progressive-prompts"): WorkflowCatalogEntry[] {
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

// Main
const baseDir = process.argv[2] || DEFAULT_WORKFLOWS_DIR;
const catalog = getWorkflowCatalog(baseDir);
console.log(JSON.stringify(catalog, null, 2));
