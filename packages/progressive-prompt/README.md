# Progressive Prompt

Execute multiple prompts sequentially with physical isolation for Claude Code.

## Why Progressive Prompt?

When working with complex multi-step tasks, Claude's attention can become diluted across many instructions. Progressive Prompt solves this by:

- **Physical Isolation**: Only one prompt is visible at a time
- **Focused Execution**: Each step gets full attention before moving to the next
- **Variable Substitution**: Pass context between steps using `{{VARIABLE}}` syntax
- **Structured Workflows**: Define reusable workflows in YAML format

## Installation

Add the marketplace to Claude Code:

```bash
/plugin marketplace add 7tsuno/claude-plugins
```

Install the plugin:

```bash
/plugin install progressive-prompt
```

## Usage

### 1. Create a Workflow

Create a `workflows/` directory in your project root:

```
your-project/
└── workflows/
    └── my-workflow/
        ├── workflow.yaml
        └── prompts/
            ├── 01-first-step.md
            └── 02-second-step.md
```

### 2. Define workflow.yaml

```yaml
name: My Workflow
description: Description of what this workflow does

args:
  - name: TARGET
    description: The target to process
    required: true
  - name: OPTIONS
    description: Optional settings
    required: false

steps:
  - name: first-step
    prompt: prompts/01-first-step.md
  - name: second-step
    prompt: prompts/02-second-step.md
```

### 3. Write Prompt Files

Use `{{VARIABLE_NAME}}` for variable substitution:

```markdown
# Step 1: Analyze

Target: {{TARGET}}
Options: {{OPTIONS}}

## Task

Analyze the target and provide insights.

## Output

List your findings.
```

### 4. Run the Workflow

Simply tell Claude:

```
Run the my-workflow workflow with TARGET=src/main.ts
```

Or use the skill directly:

```
/progressive-prompt
```

## Workflow Format

### workflow.yaml

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Display name of the workflow |
| `description` | string | Yes | What the workflow does |
| `args` | array | No | Input arguments |
| `steps` | array | Yes | List of steps to execute |

### Argument Definition

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Variable name (used as `{{NAME}}`) |
| `description` | string | Yes | Description shown to user |
| `required` | boolean | Yes | Whether the argument is required |

### Step Definition

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Step identifier |
| `prompt` | string | Yes | Path to prompt file (relative to workflow directory) |

## Examples

See the [examples/](./examples/) directory for complete workflow examples:

- **code-review**: Structured code review workflow for PRs or files
- **refactor**: Step-by-step code refactoring workflow

## Development

### Build

```bash
npm install
npm run build
```

This compiles TypeScript sources to the plugin distribution directory.

### Test

```bash
npm test
npm run test:watch  # Watch mode
```

### Project Structure

```
packages/progressive-prompt/
├── src/                    # TypeScript source
│   ├── get_next_prompt.ts
│   ├── get_workflow_args.ts
│   └── get_workflow_catalog.ts
├── tests/                  # Test files
├── examples/               # Example workflows
├── package.json
└── tsconfig.json
```

## How It Works

1. **Catalog**: `get_workflow_catalog.js` scans the `workflows/` directory and returns available workflows
2. **Args**: `get_workflow_args.js` returns the argument definitions for a selected workflow
3. **Execution**: `get_next_prompt.js` returns one prompt at a time with variables substituted

The skill ensures Claude only sees one step at a time, preventing attention dilution across complex multi-step tasks.

## License

MIT
