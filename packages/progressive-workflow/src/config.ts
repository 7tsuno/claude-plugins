#!/usr/bin/env node
/**
 * Configuration loader for progressive-workflow.
 * Reads from .progressive-workflow.json if present, otherwise uses defaults.
 */

import * as fs from "fs";
import * as path from "path";

const CONFIG_FILENAME = ".progressive-workflow.json";
const DEFAULT_WORKFLOWS_DIR = "workflows";

export interface Config {
  workflowsDir: string;
}

/**
 * Load configuration from .progressive-workflow.json in the current working directory.
 * Falls back to defaults if config file doesn't exist.
 */
export function loadConfig(cwd: string = process.cwd()): Config {
  const configPath = path.join(cwd, CONFIG_FILENAME);

  const defaults: Config = {
    workflowsDir: DEFAULT_WORKFLOWS_DIR,
  };

  if (!fs.existsSync(configPath)) {
    return defaults;
  }

  try {
    const content = fs.readFileSync(configPath, "utf-8");
    const userConfig = JSON.parse(content) as Partial<Config>;

    return {
      ...defaults,
      ...userConfig,
    };
  } catch (e) {
    console.error(`Warning: Failed to parse ${CONFIG_FILENAME}: ${e}`);
    return defaults;
  }
}

/**
 * Get the absolute path to the workflows directory.
 */
export function getWorkflowsDir(cwd: string = process.cwd()): string {
  const config = loadConfig(cwd);
  return path.resolve(cwd, config.workflowsDir);
}
