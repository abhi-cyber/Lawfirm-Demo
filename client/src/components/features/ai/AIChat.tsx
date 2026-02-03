import {useState, useEffect, useRef} from "react";
import {useNavigate} from "react-router-dom";
import {useAI} from "@/hooks/useAI";
import {
  Bot,
  Send,
  X,
  MessageSquare,
  ExternalLink,
  RotateCcw,
} from "lucide-react";

// Helper component to render message content with clickable links
const MessageContent = ({
  content,
  onNavigate,
}: {
  content: string;
  onNavigate: (path: string) => void;
}) => {
  // Parse markdown-style links: [text](url)
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const parts: (string | {text: string; url: string})[] = [];
  let lastIndex = 0;
  let match;

  while ((match = linkRegex.exec(content)) !== null) {
    // Add text before the link
    if (match.index > lastIndex) {
      parts.push(content.slice(lastIndex, match.index));
    }
    // Add the link
    parts.push({text: match[1], url: match[2]});
    lastIndex = match.index + match[0].length;
  }
  // Add remaining text
  if (lastIndex < content.length) {
    parts.push(content.slice(lastIndex));
  }

  if (parts.length === 0) {
    return <>{content}</>;
  }

  return (
    <>
      {parts.map((part, idx) => {
        if (typeof part === "string") {
          return <span key={idx}>{part}</span>;
        }
        // Check if it's an internal link (starts with /)
        const isInternalLink = part.url.startsWith("/");
        return (
          <button
            key={idx}
            onClick={() => {
              if (isInternalLink) {
                onNavigate(part.url);
              } else {
                window.open(part.url, "_blank");
              }
            }}
            className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 underline underline-offset-2 font-medium transition-colors">
            {part.text}
            {!isInternalLink && <ExternalLink className="w-3 h-3" />}
          </button>
        );
      })}
    </>
  );
};

const AIChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const {messages, sendMessage, isLoading, clearMessages} = useAI();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({behavior: "smooth"});
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage(input);
    setInput("");
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsOpen(false); // Close chat when navigating
  };

  return (
    <div
      className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50"
      data-testid="lex-root">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Open Lex Assistant"
          data-testid="lex-open"
          className="bg-amber-500 hover:bg-amber-600 text-white p-3 md:p-4 rounded-full shadow-lg transition-transform hover:scale-110">
          <MessageSquare className="w-5 h-5 md:w-6 md:h-6" />
        </button>
      )}

      {isOpen && (
        <div
          className="bg-white dark:bg-slate-900 shadow-2xl flex flex-col border border-slate-200 dark:border-slate-700 animate-in slide-in-from-bottom-10 fade-in duration-300
            fixed inset-4 rounded-2xl
            md:static md:inset-auto md:w-96 md:h-[500px] md:rounded-2xl"
          data-testid="lex-panel">
          <div className="bg-slate-900 dark:bg-slate-800 text-white p-4 rounded-t-2xl flex justify-between items-center flex-shrink-0">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-amber-500" />
              <span className="font-semibold">Lex Assistant</span>
            </div>
            <div className="flex items-center gap-2">
              {messages.length > 0 && (
                <button
                  onClick={clearMessages}
                  aria-label="Clear conversation"
                  data-testid="lex-clear"
                  title="Start new conversation"
                  className="text-slate-400 hover:text-white transition-colors p-1">
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close Lex Assistant"
                data-testid="lex-close"
                className="text-slate-400 hover:text-white transition-colors p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div
            className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-950"
            data-testid="lex-messages">
            {messages.length === 0 && (
              <div className="text-center text-slate-400 dark:text-slate-500 text-sm mt-10">
                <Bot className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p>How can I help you manage your firm today?</p>
              </div>
            )}
            {messages.map(
              (msg, idx) =>
                msg.role !== "tool" && (
                  <div
                    key={idx}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] rounded-lg p-3 text-sm ${
                        msg.role === "user"
                          ? "bg-amber-500 text-white rounded-br-none"
                          : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-none shadow-sm"
                      }`}>
                      {msg.role === "assistant" ? (
                        <MessageContent
                          content={msg.content}
                          onNavigate={handleNavigate}
                        />
                      ) : (
                        msg.content
                      )}
                    </div>
                  </div>
                ),
            )}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 rounded-bl-none shadow-sm">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></span>
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form
            onSubmit={handleSubmit}
            data-testid="lex-form"
            className="p-3 md:p-3 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-b-2xl flex-shrink-0">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything..."
                data-testid="lex-input"
                className="flex-1 px-3 py-3 md:py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-amber-500 text-base md:text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                data-testid="lex-send"
                className="bg-slate-900 dark:bg-amber-500 text-white p-3 md:p-2 rounded-lg hover:bg-slate-800 dark:hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0">
                <Send className="w-5 h-5 md:w-4 md:h-4" />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AIChat;
