---
name: progressive-workflow
description: Execute pre-defined workflows step by step. Use when user wants to run a workflow or mentions "workflow". Each step is executed in isolation to maintain focus throughout multi-step tasks.
---

# Progressive Workflow

Execute pre-defined workflows one step at a time.

## Execution Flow

1. Get workflow catalog
2. Select workflow based on user's request
3. Get args definition for selected workflow
4. Ask user for missing required args
5. Execute each step using `get_next_prompt.js`

## Step 1: Get Catalog

```bash
node <SKILL_DIR>/scripts/get_workflow_catalog.js
```

Returns:
```json
[{"id": "review", "name": "Review", "description": "Code review"}]
```

## Step 2: Get Args (after selecting workflow)

```bash
node <SKILL_DIR>/scripts/get_workflow_args.js <workflow_id>
```

Returns:
```json
[{"name": "PR_NUMBER", "description": "PR number", "required": true}]
```

If required args are missing from user's request, ask the user.

## Step 3: Execute Steps

```bash
node <SKILL_DIR>/scripts/get_next_prompt.js <workflow_id> <step_index> '<variables_json>'
```

Returns:
```json
{"step_index": 0, "prompt": "...", "total_steps": 3, "is_last": false}
```

Execute the returned prompt, then call with `step_index + 1` until `is_last` is true.

## Important

- Never read workflow.yaml directly. Always use `get_next_prompt.js` to get one prompt at a time.
- **NEVER skip steps or try to "optimize" by doing multiple steps at once.** Always execute each step one by one using `get_next_prompt.js` until `is_last` is true.
- Even if the steps seem repetitive or predictable, you MUST call `get_next_prompt.js` for each step. The workflow is designed to maintain focus and prevent context overload.
