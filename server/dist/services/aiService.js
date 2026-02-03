"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatWithAI = void 0;
const axios_1 = __importDefault(require("axios"));
// ===========================================
// Configuration
// ===========================================
// Toggle between local (Ollama) and cloud (OpenAI) LLM
const USE_LOCAL_LLM = process.env.USE_LOCAL_LLM !== "false"; // Default to true
// Ollama configuration (local)
const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434/api/chat";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3";
// OpenAI configuration (cloud)
// Get your API key at: https://platform.openai.com/api-keys
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
// System prompt to guide the AI assistant
const SYSTEM_PROMPT = `You are Lex, an AI assistant for ABC Law Firm's management system. You help attorneys and staff manage clients, cases, tasks, and team members.

CRITICAL TOOL SELECTION RULES:
1. When user wants to CREATE/ADD a NEW client → use "create_client" tool
2. When user wants to CREATE/ADD a NEW case → use "create_case" tool
3. When user wants to CREATE/ADD a NEW task → use "create_task" tool
4. When user wants to LIST/SHOW/VIEW ALL items → use the corresponding "list_*" tool
5. When user wants to GET INFO about a SPECIFIC item → use the corresponding "get_*_info" tool
6. When user wants to UPDATE an existing item → use the corresponding "update_*" tool

IMPORTANT: When the user uses words like "create", "add", "new", or "register" followed by client/case/task, you MUST use the create_* tool, NOT the list_* or get_*_info tools.

Examples:
- "Create a client named John" → use create_client with name="John"
- "Add a new client with email test@test.com" → use create_client
- "Show me all clients" → use list_clients
- "Get info about client John" → use get_client_info

CRITICAL FORMATTING RULES:
1. When tool results contain markdown links in the format [text](url), you MUST include them EXACTLY as provided in your response.
2. After creating or updating a case, ALWAYS include the "View Case →" link from the tool result.
3. Do NOT summarize or remove links - they are clickable in the user interface.
4. Be concise but ALWAYS preserve any links from tool results.

Example: If a tool returns "✅ Case created. [View Case →](/cases/123)", include that exact link in your response.`;
// ===========================================
// Local LLM (Ollama) Implementation
// ===========================================
const chatWithOllama = (messages, availableTools) => __awaiter(void 0, void 0, void 0, function* () {
    const payload = {
        model: OLLAMA_MODEL,
        messages,
        tools: availableTools,
        stream: false,
    };
    const response = yield axios_1.default.post(OLLAMA_URL, payload);
    return response.data;
});
// ===========================================
// Cloud LLM (OpenAI) Implementation
// ===========================================
/**
 * Chat with OpenAI API (GPT-4o-mini)
 * Uses native OpenAI format with function/tool calling support
 */
const chatWithOpenAI = (messages, availableTools) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (!OPENAI_API_KEY || OPENAI_API_KEY === "your-openai-api-key-here") {
        throw new Error("OpenAI API key not configured. Please set OPENAI_API_KEY in your .env file. " +
            "Get your API key at: https://platform.openai.com/api-keys");
    }
    // OpenAI expects tool_calls arguments as stringified JSON
    const formattedMessages = messages.map((msg) => {
        if (msg.role === "assistant" && msg.tool_calls) {
            return Object.assign(Object.assign({}, msg), { tool_calls: msg.tool_calls.map((tc) => (Object.assign(Object.assign({}, tc), { function: Object.assign(Object.assign({}, tc.function), { arguments: typeof tc.function.arguments === "string"
                            ? tc.function.arguments
                            : JSON.stringify(tc.function.arguments || {}) }) }))) });
        }
        return msg;
    });
    // Check if the last message is a tool result - if so, don't include tools
    // This forces the LLM to generate a final text response
    const lastMessage = formattedMessages[formattedMessages.length - 1];
    const hasToolResult = (lastMessage === null || lastMessage === void 0 ? void 0 : lastMessage.role) === "tool";
    const payload = {
        model: OPENAI_MODEL,
        messages: formattedMessages,
        stream: false,
    };
    // Only include tools if we haven't just received a tool result
    if (!hasToolResult && availableTools && availableTools.length > 0) {
        payload.tools = availableTools;
        payload.tool_choice = "auto";
    }
    const response = yield axios_1.default.post(OPENAI_API_URL, payload, {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
    });
    // Transform OpenAI response to Ollama format for consistency
    const choice = (_a = response.data.choices) === null || _a === void 0 ? void 0 : _a[0];
    if (!choice) {
        throw new Error("No response from OpenAI API");
    }
    const message = choice.message;
    // Handle tool calls - OpenAI returns arguments as string
    if (message.tool_calls && message.tool_calls.length > 0) {
        return {
            message: {
                role: "assistant",
                content: message.content || "",
                tool_calls: message.tool_calls.map((tc) => ({
                    id: tc.id,
                    type: "function",
                    function: {
                        name: tc.function.name,
                        // Parse arguments if string, otherwise use as-is
                        arguments: typeof tc.function.arguments === "string"
                            ? JSON.parse(tc.function.arguments || "{}")
                            : tc.function.arguments || {},
                    },
                })),
            },
        };
    }
    // Regular text response
    return {
        message: {
            role: "assistant",
            content: message.content || "",
            tool_calls: undefined,
        },
    };
});
// ===========================================
// Main Export - Routes to appropriate provider
// ===========================================
const chatWithAI = (messages, availableTools) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    try {
        // Add system prompt if not already present
        const messagesWithSystem = ((_a = messages[0]) === null || _a === void 0 ? void 0 : _a.role) === "system"
            ? messages
            : [{ role: "system", content: SYSTEM_PROMPT }, ...messages];
        // Log which provider is being used (helpful for debugging)
        console.log(`[AI Service] Using ${USE_LOCAL_LLM ? "Ollama (local)" : "OpenAI (cloud)"}`);
        if (USE_LOCAL_LLM) {
            return yield chatWithOllama(messagesWithSystem, availableTools);
        }
        else {
            return yield chatWithOpenAI(messagesWithSystem, availableTools);
        }
    }
    catch (error) {
        console.error("AI Service Error:", error.message);
        // Log full error details for OpenAI API errors
        if (!USE_LOCAL_LLM && ((_b = error.response) === null || _b === void 0 ? void 0 : _b.data)) {
            console.error("[OpenAI API Error Details]:", JSON.stringify(error.response.data, null, 2));
        }
        // Provider-specific error handling
        if (USE_LOCAL_LLM && error.code === "ECONNREFUSED") {
            throw new Error("Ollama is not running. Please start Ollama.");
        }
        if (!USE_LOCAL_LLM && ((_c = error.response) === null || _c === void 0 ? void 0 : _c.status) === 400) {
            const errorMsg = ((_f = (_e = (_d = error.response) === null || _d === void 0 ? void 0 : _d.data) === null || _e === void 0 ? void 0 : _e.error) === null || _f === void 0 ? void 0 : _f.message) || "Bad request";
            throw new Error(`OpenAI API error: ${errorMsg}`);
        }
        if (!USE_LOCAL_LLM && ((_g = error.response) === null || _g === void 0 ? void 0 : _g.status) === 401) {
            throw new Error("Invalid OpenAI API key. Please check your OPENAI_API_KEY.");
        }
        if (!USE_LOCAL_LLM && ((_h = error.response) === null || _h === void 0 ? void 0 : _h.status) === 429) {
            throw new Error("OpenAI rate limit exceeded. Please wait a moment and try again.");
        }
        if (!USE_LOCAL_LLM && ((_j = error.response) === null || _j === void 0 ? void 0 : _j.status) === 500) {
            throw new Error("OpenAI server error. Please try again in a moment.");
        }
        throw error;
    }
});
exports.chatWithAI = chatWithAI;
