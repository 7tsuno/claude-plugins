---
name: progressive-prompt
description: Execute multiple prompts sequentially with physical isolation. Use when (1) user explicitly mentions "progressive prompt" or "workflow", or (2) complex multi-step tasks need focused execution. Prevents attention loss by showing only one prompt at a time.
---

# Progressive Prompt

Execute pre-defined workflows one prompt at a time.

## Execution Flow

1. Get workflow catalog
2. Select workflow based on user's request
3. Get args definition for selected workflow
4. Ask user for missing required args
5. Execute each step using `get_next_prompt.ts`

## Step 1: Get Catalog

```bash
npx tsx <BASE_DIR>/scripts/get_workflow_catalog.ts
```

Returns:
```json
[{"id": "review", "name": "Review", "description": "Code review"}]
```

## Step 2: Get Args (after selecting workflow)

```bash
npx tsx <BASE_DIR>/scripts/get_workflow_args.ts <workflow_id>
```

Returns:
```json
[{"name": "PR_NUMBER", "description": "PR number", "required": true}]
```

If required args are missing from user's request, ask the user.

## Step 3: Execute Steps

```bash
npx tsx <BASE_DIR>/scripts/get_next_prompt.ts <workflow_id> <step_index> '<variables_json>'
```

Returns:
```json
{"step_index": 0, "prompt": "...", "total_steps": 3, "is_last": false}
```

Execute the returned prompt, then call with `step_index + 1` until `is_last` is true.

## Important

Never read workflow.yaml directly. Always use `get_next_prompt.ts` to get one prompt at a time.
