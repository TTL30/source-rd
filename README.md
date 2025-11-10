# Source-RD Claude Code Marketplace

A curated marketplace of Claude Code plugins for enhanced development workflows.

## Available Plugins

### Context-Aware Development Plugin

**Status:** Phase 1 Complete ✅

Enhances development workflows with organizational knowledge sharing, guided development processes, and persistent context across sessions.

**Features:**
- Session management with artifact directories
- Tool usage tracking
- Foundation for pattern library and guided workflows

[View Plugin Documentation](./plugins/context-aware-dev/README.md)

## Installation

### Add This Marketplace

```bash
# Replace YOUR_USERNAME with your GitHub username
claude plugin marketplace add YOUR_USERNAME/source-rd
```

### Verify Marketplace Added

```bash
claude plugin marketplace list
```

You should see `source-rd` in the list.

### Install a Plugin

```bash
# Install the context-aware-dev plugin
claude plugin install context-aware-dev@source-rd
```

### Verify Plugin Installed

```bash
claude plugin list
```

## Usage

Once installed, plugins activate automatically when you start Claude in any project:

```bash
cd /path/to/your/project
claude
```

Look for plugin activation messages in the console.

## Plugin Development

### Repository Structure

```
source-rd/
├── .claude-plugin/
│   └── marketplace.json      # Marketplace manifest
├── plugins/
│   └── context-aware-dev/    # Individual plugin
│       ├── .claude-plugin/
│       │   └── plugin.json   # Plugin manifest
│       ├── hooks/
│       │   └── hooks.json    # Hook configuration
│       ├── src/              # TypeScript source
│       ├── dist/             # Compiled JavaScript
│       ├── package.json
│       ├── tsconfig.json
│       └── README.md
├── .gitignore
└── README.md                 # This file
```

### Adding New Plugins

1. Create plugin directory: `plugins/your-plugin-name/`
2. Add plugin files and manifest
3. Update `.claude-plugin/marketplace.json` to include the new plugin
4. Commit and push to GitHub
5. Users can install with: `claude plugin install your-plugin-name@source-rd`

### Building Plugins

Each plugin with TypeScript must be built before use:

```bash
cd plugins/context-aware-dev
npm install
npm run build
```

**Important:** The `dist/` directory with compiled JavaScript must be committed to the repository for GitHub marketplace installation to work.

## Updating Plugins

### For Plugin Developers

1. Make changes to plugin source code
2. Rebuild: `npm run build`
3. Update version in `plugin.json` and `package.json`
4. Commit all changes (including `dist/` directory)
5. Push to GitHub

### For Plugin Users

```bash
claude plugin update context-aware-dev
```

## Marketplace Manifest

The `.claude-plugin/marketplace.json` file defines the marketplace structure:

```json
{
  "name": "source-rd",
  "version": "1.0.0",
  "description": "Claude Code plugin marketplace",
  "owner": {
    "name": "Your Name",
    "url": "https://github.com/YOUR_USERNAME"
  },
  "plugins": [
    {
      "name": "context-aware-dev",
      "source": "./plugins/context-aware-dev",
      "version": "0.1.0",
      "description": "...",
      "author": {...},
      "keywords": [...]
    }
  ]
}
```

## Requirements

- Node.js >= 20.0.0
- Claude Code CLI
- Git

## Support

For issues and questions:
- GitHub Issues: https://github.com/YOUR_USERNAME/source-rd/issues
- Plugin-specific issues: See individual plugin README files

## License

MIT

## Contributing

Contributions are welcome! To contribute:

1. Fork this repository
2. Create a new branch for your changes
3. Make your changes (new plugin or improvements to existing ones)
4. Build and test your changes
5. Submit a pull request

For plugin contributions, please ensure:
- Plugin follows the directory structure above
- README.md is included with clear documentation
- TypeScript is properly compiled to `dist/` directory
- All hook scripts are executable

## Roadmap

### Context-Aware Development Plugin

- [x] Phase 1: Plugin Foundation
- [ ] Phase 2: Organizational Knowledge Hub (Skills)
- [ ] Phase 3: Guided Workflow Commands
- [ ] Phase 4: Persistent Context & Smart Resumption
- [ ] Phase 5: Production Polish

### Future Plugins

Have ideas for new plugins? Open an issue or submit a pull request!
