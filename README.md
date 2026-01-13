# Progressive Prompt

A Claude Code plugin that executes multiple prompts sequentially with physical isolation.

## Overview

Break long tasks into multiple steps and show only one prompt at a time, preventing Claude's attention degradation. Workflows are defined in `workflow.yaml`, with each step's prompt managed as a Markdown file.

## Installation

### As a Plugin (Recommended)

1. Add the marketplace:
```bash
/plugin marketplace add 7tsuno/progressive-prompt
```

2. Install the plugin:
```bash
/plugin install progressive-prompt
```

### Manual Installation

Copy the `skills/` directory to your project:

```bash
cp -r skills/progressive-prompt /path/to/your/project/.claude/skills/
```

## Setup

Create a `workflows/` directory in your project root with your workflow definitions:

```
your-project/
└── workflows/
    └── <workflow-id>/
        ├── workflow.yaml
        └── prompts/
            ├── step1.md
            └── step2.md
```

## Creating Workflows

### workflow.yaml

```yaml
name: My Workflow
description: Description of the workflow

args:
  - name: TARGET_FILE
    description: Target file to process
    required: true
  - name: OPTIONAL_PARAM
    description: Optional parameter
    required: false

steps:
  - name: analyze
    prompt: prompts/analyze.md
  - name: implement
    prompt: prompts/implement.md
  - name: review
    prompt: prompts/review.md
```

### Prompt Files

`prompts/analyze.md`:

```markdown
# Analysis Step

Analyze {{TARGET_FILE}}.

## Tasks
1. Read the file
2. Understand the structure
3. Report findings
```

`{{VARIABLE_NAME}}` placeholders are substituted at runtime.

## Usage

In Claude Code, mention "progressive prompt" or "workflow" to trigger this skill:

```
> Run the workflow
```

The skill operates in this order:
1. Get list of available workflows
2. Select workflow based on user's request
3. Check required arguments (ask user if missing)
4. Execute each step sequentially

## Example Workflows

The `examples/` directory contains sample workflows for reference:

- `code-review`: Structured code review workflow
- `refactor`: Step-by-step refactoring workflow

To use an example, copy it to your project's `workflows/` directory:

```bash
cp -r examples/code-review workflows/
```

## Development

### Build

```bash
npm install
npm run build
```

TypeScript source (`src/`) compiles to `skills/progressive-prompt/scripts/`.

### Test

```bash
npm test           # Run tests
npm run test:watch # Watch mode
```

## Plugin Structure

```
progressive-prompt/
├── .claude-plugin/
│   ├── plugin.json        # Plugin metadata
│   └── marketplace.json   # Marketplace definition
├── skills/
│   └── progressive-prompt/
│       ├── SKILL.md
│       └── scripts/*.js
├── examples/              # Sample workflows (not included in plugin)
├── src/                   # TypeScript source
└── tests/
```

## License

MIT
