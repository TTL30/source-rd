# Context-Aware Development Plugin

A Claude Code plugin that enhances development workflows with organizational knowledge sharing, guided development processes, and persistent context across sessions.

## Features (Roadmap)

### Phase 1: Plugin Foundation (Current)
- ✅ SessionStart hook - Initializes session context and creates artifact directories
- ✅ PostToolUse hook - Tracks tool usage
- ✅ GitHub marketplace distribution

### Phase 2: Organizational Knowledge Hub (Planned)
- Plugin Skills for pattern discovery
- Auto-suggestion of organizational patterns
- Pattern library management

### Phase 3: Guided Workflow (Planned)
- `/elaborate` - Interactive functional specification creation
- `/plan` - Technical planning based on specs
- `/implement` - Step-by-step guided implementation

### Phase 4: Persistent Context (Planned)
- Smart resumption on session start
- Artifact persistence across sessions
- CLAUDE.md auto-generation and refresh detection

### Phase 5: Production Polish (Planned)
- Comprehensive error handling
- Performance optimization
- Full documentation and tests

## Installation

### Prerequisites
- Node.js >= 20.0.0
- Claude Code CLI

### From GitHub Marketplace

1. **Add the marketplace** (customize with your GitHub username):
   ```bash
   claude plugin marketplace add YOUR_USERNAME/claude-marketplace
   ```

2. **Verify marketplace was added**:
   ```bash
   claude plugin marketplace list
   ```

3. **Install the plugin**:
   ```bash
   claude plugin install context-aware-dev@context-aware-marketplace
   ```

4. **Verify installation**:
   ```bash
   claude plugin list
   ```

### Local Development

1. **Clone and navigate to the plugin directory**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/claude-marketplace.git
   cd claude-marketplace/plugins/context-aware-dev
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Build the plugin**:
   ```bash
   npm run build
   ```

4. **Make hooks executable**:
   ```bash
   chmod +x dist/hooks/*.js
   ```

5. **Link the plugin locally**:
   ```bash
   claude plugin link .
   ```

## Usage

### Phase 1 Features

Once installed, the plugin automatically:

1. **Creates artifact directories** on session start:
   - `.claude/` - Plugin configuration and artifacts
   - `.claude/artifacts/` - Session artifacts storage
   - `.claude/artifacts/<session-id>/` - Current session artifacts

2. **Logs tool usage** for monitoring and debugging

### Testing the Plugin

1. Navigate to any project:
   ```bash
   cd /path/to/your/project
   ```

2. Start Claude:
   ```bash
   claude
   ```

3. Look for activation messages:
   ```
   [Context-Aware Plugin] Session abc123... started (startup)
   [Context-Aware Plugin] ✓ Plugin ready
   [Context-Aware Plugin] Artifact directory: /path/to/project/.claude/artifacts/abc123...
   ```

4. Use any tool and observe logging:
   ```
   [Context-Aware Plugin] Tool used: Read
   [Context-Aware Plugin] Output length: 1234 characters
   ```

## Development

### Project Structure

```
plugins/context-aware-dev/
├── .claude-plugin/
│   └── plugin.json          # Plugin manifest
├── hooks/
│   └── hooks.json           # Hook configuration
├── src/
│   ├── index.ts             # Main plugin entry point
│   └── hooks/
│       ├── session-start.ts # SessionStart hook implementation
│       └── post-tool-use.ts # PostToolUse hook implementation
├── dist/                    # Compiled JavaScript (generated)
├── package.json
├── tsconfig.json
└── README.md
```

### Build Commands

- `npm run build` - Compile TypeScript to JavaScript
- `npm run watch` - Watch mode for development
- `npm run clean` - Remove dist directory
- `npm run rebuild` - Clean and build

### Hook Environment Variables

The plugin uses these Claude Code environment variables:

- `${CLAUDE_PLUGIN_ROOT}` - Absolute path to plugin installation directory
- `${CLAUDE_SESSION_ID}` - Unique session identifier
- `${CLAUDE_MATCHER}` - Session start type (startup/resume/clear/compact)
- `${CLAUDE_PROJECT_DIR}` - Current project directory
- `${CLAUDE_TOOL_NAME}` - Name of tool that was used
- `${CLAUDE_TOOL_OUTPUT}` - Output from tool execution

## Publishing Updates

1. **Make your changes and rebuild**:
   ```bash
   npm run build
   ```

2. **Update version** in `plugin.json` and `package.json`

3. **Commit and push**:
   ```bash
   git add .
   git commit -m "Your update description"
   git push origin main
   ```

4. **Users can update with**:
   ```bash
   claude plugin update context-aware-dev
   ```

## Troubleshooting

### Plugin doesn't activate

1. Check if plugin is installed:
   ```bash
   claude plugin list
   ```

2. Verify build completed successfully:
   ```bash
   cd plugins/context-aware-dev
   npm run build
   ls -la dist/hooks/
   ```

3. Check hook files are executable:
   ```bash
   chmod +x dist/hooks/*.js
   ```

### Hooks not triggering

1. Verify `hooks/hooks.json` exists and is valid JSON
2. Check Claude Code logs for error messages
3. Test hooks manually:
   ```bash
   node dist/hooks/session-start.js test-session startup /tmp/test
   ```

### Permission errors

Make sure the hooks have execute permissions:
```bash
chmod +x dist/hooks/*.js
```

## License

MIT

## Author

Your Name <your@email.com>

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Support

For issues and questions:
- GitHub Issues: https://github.com/YOUR_USERNAME/claude-marketplace/issues
- Documentation: See docs/ directory (coming in Phase 5)
