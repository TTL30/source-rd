#!/usr/bin/env node
interface PostToolUseInput {
    session_id: string;
    transcript_path: string;
    cwd: string;
    permission_mode: string;
    hook_event_name: string;
    tool_name: string;
    tool_input: Record<string, any>;
    tool_response: Record<string, any>;
}
declare function handlePostToolUse(input: PostToolUseInput): Promise<void>;
declare function readStdin(): Promise<string>;
//# sourceMappingURL=post-tool-use.d.ts.map