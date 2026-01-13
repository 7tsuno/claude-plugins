# 7tsuno Claude Plugins

A collection of Claude Code plugins.

## Installation

Add this marketplace to Claude Code:

```bash
/plugin marketplace add 7tsuno/claude-plugins
```

Then install any plugin:

```bash
/plugin install progressive-prompt
```

## Available Plugins

| Plugin | Description |
|--------|-------------|
| [progressive-prompt](./packages/progressive-prompt/README.md) | Execute multiple prompts sequentially with physical isolation |

## Repository Structure

```
claude-plugins/
├── .claude-plugin/
│   └── marketplace.json       # Marketplace definition
├── plugins/                   # Distribution (plugins)
│   └── progressive-prompt/
│       ├── .claude-plugin/
│       │   └── plugin.json
│       └── skills/
│           └── progressive-prompt/
│               ├── SKILL.md
│               └── scripts/*.js
├── packages/                  # Development (source)
│   └── progressive-prompt/
│       ├── src/
│       ├── tests/
│       ├── examples/
│       └── package.json
└── README.md
```

## Development

Each plugin has its own development environment in `packages/`:

```bash
cd packages/progressive-prompt
npm install
npm run build   # Build to plugins/
npm test        # Run tests
```

## License

MIT
