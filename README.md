# 7tsuno Claude Plugins

A collection of Claude Code plugins.

## Installation

Add this marketplace to Claude Code:

```bash
/plugin marketplace add 7tsuno/claude-plugins
```

Then install any plugin:

```bash
/plugin install progressive-workflow
```

## Available Plugins

| Plugin | Description |
|--------|-------------|
| [progressive-workflow](./packages/progressive-workflow/README.md) | Execute pre-defined workflows step by step |

## Repository Structure

```
claude-plugins/
├── .claude-plugin/
│   └── marketplace.json       # Marketplace definition
├── plugins/                   # Distribution (plugins)
│   └── progressive-workflow/
│       ├── .claude-plugin/
│       │   └── plugin.json
│       └── skills/
│           └── progressive-workflow/
│               ├── SKILL.md
│               └── scripts/*.js
├── packages/                  # Development (source)
│   └── progressive-workflow/
│       ├── src/
│       ├── tests/
│       ├── examples/
│       └── package.json
└── README.md
```

## Development

Each plugin has its own development environment in `packages/`:

```bash
cd packages/progressive-workflow
npm install
npm run build   # Build to plugins/
npm test        # Run tests
```

## License

MIT
