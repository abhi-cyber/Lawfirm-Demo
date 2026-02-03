import axios from "axios";

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

const chatWithOllama = async (messages: any[], availableTools: any[]) => {
  const payload = {
    model: OLLAMA_MODEL,
    messages,
    tools: availableTools,
    stream: false,
  };

  const response = await axios.post(OLLAMA_URL, payload);
  return response.data;
};

// ===========================================
// Cloud LLM (OpenAI) Implementation
// ===========================================

/**
 * Chat with OpenAI API (GPT-4o-mini)
 * Uses native OpenAI format with function/tool calling support
 */
const chatWithOpenAI = async (messages: any[], availableTools: any[]) => {
  if (!OPENAI_API_KEY || OPENAI_API_KEY === "your-openai-api-key-here") {
    throw new Error(
      "OpenAI API key not configured. Please set OPENAI_API_KEY in your .env file. " +
        "Get your API key at: https://platform.openai.com/api-keys",
    );
  }

  // OpenAI expects tool_calls arguments as stringified JSON
  const formattedMessages = messages.map((msg) => {
    if (msg.role === "assistant" && msg.tool_calls) {
      return {
        ...msg,
        tool_calls: msg.tool_calls.map((tc: any) => ({
          ...tc,
          function: {
            ...tc.function,
            arguments:
              typeof tc.function.arguments === "string"
                ? tc.function.arguments
                : JSON.stringify(tc.function.arguments || {}),
          },
        })),
      };
    }
    return msg;
  });

  // Check if the last message is a tool result - if so, don't include tools
  // This forces the LLM to generate a final text response
  const lastMessage = formattedMessages[formattedMessages.length - 1];
  const hasToolResult = lastMessage?.role === "tool";

  const payload: any = {
    model: OPENAI_MODEL,
    messages: formattedMessages,
    stream: false,
  };

  // Only include tools if we haven't just received a tool result
  if (!hasToolResult && availableTools && availableTools.length > 0) {
    payload.tools = availableTools;
    payload.tool_choice = "auto";
  }

  const response = await axios.post(OPENAI_API_URL, payload, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
  });

  // Transform OpenAI response to Ollama format for consistency
  const choice = response.data.choices?.[0];

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
        tool_calls: message.tool_calls.map((tc: any) => ({
          id: tc.id,
          type: "function",
          function: {
            name: tc.function.name,
            // Parse arguments if string, otherwise use as-is
            arguments:
              typeof tc.function.arguments === "string"
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
};

// ===========================================
// Main Export - Routes to appropriate provider
// ===========================================

export const chatWithAI = async (messages: any[], availableTools: any[]) => {
  try {
    // Add system prompt if not already present
    const messagesWithSystem =
      messages[0]?.role === "system"
        ? messages
        : [{role: "system", content: SYSTEM_PROMPT}, ...messages];

    // Log which provider is being used (helpful for debugging)
    console.log(
      `[AI Service] Using ${USE_LOCAL_LLM ? "Ollama (local)" : "OpenAI (cloud)"}`,
    );

    if (USE_LOCAL_LLM) {
      return await chatWithOllama(messagesWithSystem, availableTools);
    } else {
      return await chatWithOpenAI(messagesWithSystem, availableTools);
    }
  } catch (error: any) {
    console.error("AI Service Error:", error.message);

    // Log full error details for OpenAI API errors
    if (!USE_LOCAL_LLM && error.response?.data) {
      console.error(
        "[OpenAI API Error Details]:",
        JSON.stringify(error.response.data, null, 2),
      );
    }

    // Provider-specific error handling
    if (USE_LOCAL_LLM && error.code === "ECONNREFUSED") {
      throw new Error("Ollama is not running. Please start Ollama.");
    }

    if (!USE_LOCAL_LLM && error.response?.status === 400) {
      const errorMsg = error.response?.data?.error?.message || "Bad request";
      throw new Error(`OpenAI API error: ${errorMsg}`);
    }

    if (!USE_LOCAL_LLM && error.response?.status === 401) {
      throw new Error(
        "Invalid OpenAI API key. Please check your OPENAI_API_KEY.",
      );
    }

    if (!USE_LOCAL_LLM && error.response?.status === 429) {
      throw new Error(
        "OpenAI rate limit exceeded. Please wait a moment and try again.",
      );
    }

    if (!USE_LOCAL_LLM && error.response?.status === 500) {
      throw new Error("OpenAI server error. Please try again in a moment.");
    }

    throw error;
  }
};
