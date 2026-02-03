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
exports.handleChat = void 0;
const aiService_1 = require("../services/aiService");
const Client_1 = __importDefault(require("../models/Client"));
const Case_1 = __importDefault(require("../models/Case"));
const Task_1 = __importDefault(require("../models/Task"));
const User_1 = __importDefault(require("../models/User"));
// Define comprehensive tools for all CRUD operations
const tools = [
    // ===== CLIENT TOOLS =====
    {
        type: "function",
        function: {
            name: "list_clients",
            description: "Get a list of all clients with optional status filter",
            parameters: {
                type: "object",
                properties: {
                    status: {
                        type: ["string", "null"],
                        enum: ["active", "inactive", "prospect"],
                        description: "Filter by client status (optional)",
                    },
                },
                required: [],
            },
        },
    },
    {
        type: "function",
        function: {
            name: "get_client_info",
            description: "Get detailed information about a specific client by name",
            parameters: {
                type: "object",
                properties: {
                    clientName: {
                        type: "string",
                        description: "Name of the client to look up",
                    },
                },
                required: ["clientName"],
            },
        },
    },
    {
        type: "function",
        function: {
            name: "create_client",
            description: "Create a new client in the system",
            parameters: {
                type: "object",
                properties: {
                    name: { type: "string", description: "Client name" },
                    email: { type: "string", description: "Client email address" },
                    phone: {
                        type: ["string", "null"],
                        description: "Client phone number (optional)",
                    },
                    companyName: {
                        type: ["string", "null"],
                        description: "Company name (optional)",
                    },
                    status: {
                        type: ["string", "null"],
                        enum: ["active", "inactive", "prospect"],
                        description: "Client status (optional)",
                    },
                },
                required: ["name", "email"],
            },
        },
    },
    {
        type: "function",
        function: {
            name: "update_client",
            description: "Update an existing client's information",
            parameters: {
                type: "object",
                properties: {
                    clientName: {
                        type: "string",
                        description: "Current name of the client to update",
                    },
                    newName: {
                        type: ["string", "null"],
                        description: "New name (optional)",
                    },
                    email: {
                        type: ["string", "null"],
                        description: "New email (optional)",
                    },
                    phone: {
                        type: ["string", "null"],
                        description: "New phone (optional)",
                    },
                    status: {
                        type: ["string", "null"],
                        enum: ["active", "inactive", "prospect"],
                        description: "New status (optional)",
                    },
                },
                required: ["clientName"],
            },
        },
    },
    {
        type: "function",
        function: {
            name: "add_client_note",
            description: "Add a note to a client's profile",
            parameters: {
                type: "object",
                properties: {
                    clientName: { type: "string", description: "Name of the client" },
                    noteContent: { type: "string", description: "Content of the note" },
                },
                required: ["clientName", "noteContent"],
            },
        },
    },
    // ===== CASE TOOLS =====
    {
        type: "function",
        function: {
            name: "list_cases",
            description: "Get a list of all cases with optional filters",
            parameters: {
                type: "object",
                properties: {
                    status: {
                        type: ["string", "null"],
                        enum: ["intake", "discovery", "trial", "closed"],
                        description: "Filter by case status (optional)",
                    },
                    priority: {
                        type: ["string", "null"],
                        enum: ["high", "medium", "low"],
                        description: "Filter by priority (optional)",
                    },
                },
                required: [],
            },
        },
    },
    {
        type: "function",
        function: {
            name: "get_case_info",
            description: "Get detailed information about a specific case by title or case number",
            parameters: {
                type: "object",
                properties: {
                    caseIdentifier: {
                        type: "string",
                        description: "Case title or case number",
                    },
                },
                required: ["caseIdentifier"],
            },
        },
    },
    {
        type: "function",
        function: {
            name: "update_case_status",
            description: "Update the status of a case (move it through the workflow)",
            parameters: {
                type: "object",
                properties: {
                    caseIdentifier: {
                        type: "string",
                        description: "Case title or case number",
                    },
                    newStatus: {
                        type: "string",
                        enum: ["intake", "discovery", "trial", "closed"],
                        description: "New status for the case",
                    },
                },
                required: ["caseIdentifier", "newStatus"],
            },
        },
    },
    {
        type: "function",
        function: {
            name: "create_case",
            description: "Create a new legal case in the system",
            parameters: {
                type: "object",
                properties: {
                    title: {
                        type: "string",
                        description: "Title of the case (e.g., 'Smith vs. Jones')",
                    },
                    clientName: {
                        type: "string",
                        description: "Name of the client this case is for",
                    },
                    description: {
                        type: ["string", "null"],
                        description: "Description of the case (optional)",
                    },
                    priority: {
                        type: ["string", "null"],
                        enum: ["high", "medium", "low"],
                        description: "Priority level of the case (optional)",
                    },
                    status: {
                        type: ["string", "null"],
                        enum: ["intake", "discovery", "trial", "closed"],
                        description: "Initial status of the case (defaults to intake, optional)",
                    },
                },
                required: ["title", "clientName"],
            },
        },
    },
    // ===== TASK TOOLS =====
    {
        type: "function",
        function: {
            name: "list_tasks",
            description: "Get a list of all tasks with optional filters",
            parameters: {
                type: "object",
                properties: {
                    status: {
                        type: ["string", "null"],
                        enum: ["pending", "in-progress", "completed"],
                        description: "Filter by task status (optional)",
                    },
                    priority: {
                        type: ["string", "null"],
                        enum: ["high", "medium", "low"],
                        description: "Filter by priority (optional)",
                    },
                    assigneeName: {
                        type: ["string", "null"],
                        description: "Filter by assignee name (optional)",
                    },
                },
                required: [],
            },
        },
    },
    {
        type: "function",
        function: {
            name: "create_task",
            description: "Create a new task",
            parameters: {
                type: "object",
                properties: {
                    title: { type: "string", description: "Task title" },
                    description: {
                        type: ["string", "null"],
                        description: "Task description (optional)",
                    },
                    assigneeName: {
                        type: "string",
                        description: "Name of the team member to assign",
                    },
                    priority: {
                        type: ["string", "null"],
                        enum: ["high", "medium", "low"],
                        description: "Task priority (optional)",
                    },
                    dueDate: {
                        type: ["string", "null"],
                        description: "Due date in YYYY-MM-DD format (optional)",
                    },
                    caseName: {
                        type: ["string", "null"],
                        description: "Related case title (optional)",
                    },
                },
                required: ["title", "assigneeName"],
            },
        },
    },
    {
        type: "function",
        function: {
            name: "update_task_status",
            description: "Update the status of a task",
            parameters: {
                type: "object",
                properties: {
                    taskTitle: { type: "string", description: "Title of the task" },
                    newStatus: {
                        type: "string",
                        enum: ["pending", "in-progress", "completed"],
                        description: "New status",
                    },
                },
                required: ["taskTitle", "newStatus"],
            },
        },
    },
    // ===== TEAM TOOLS =====
    {
        type: "function",
        function: {
            name: "list_team_members",
            description: "Get a list of all team members with optional role filter",
            parameters: {
                type: "object",
                properties: {
                    role: {
                        type: ["string", "null"],
                        enum: ["partner", "associate", "paralegal", "staff"],
                        description: "Filter by role (optional)",
                    },
                },
                required: [],
            },
        },
    },
    {
        type: "function",
        function: {
            name: "get_team_member_info",
            description: "Get detailed information about a team member",
            parameters: {
                type: "object",
                properties: {
                    memberName: { type: "string", description: "Name of the team member" },
                },
                required: ["memberName"],
            },
        },
    },
    // ===== DASHBOARD/SUMMARY TOOLS =====
    {
        type: "function",
        function: {
            name: "get_dashboard_summary",
            description: "Get a summary of the firm's current status including counts of clients, cases, tasks, and team members",
            parameters: {
                type: "object",
                properties: {},
                required: [],
            },
        },
    },
];
// Helper function to execute a single tool call
function executeTool(functionName, args) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        try {
            // ===== CLIENT TOOLS =====
            if (functionName === "list_clients") {
                const filter = {};
                if (args.status)
                    filter.status = args.status;
                const clients = yield Client_1.default.find(filter).select("name email status companyName phone");
                if (clients.length === 0) {
                    return "No clients found matching the criteria.";
                }
                return JSON.stringify(clients.map((c) => ({
                    name: c.name,
                    email: c.email,
                    status: c.status,
                    company: c.companyName || "N/A",
                    phone: c.phone || "N/A",
                })));
            }
            if (functionName === "get_client_info") {
                const client = yield Client_1.default.findOne({
                    name: { $regex: new RegExp(args.clientName, "i") },
                });
                if (client) {
                    return JSON.stringify({
                        name: client.name,
                        email: client.email,
                        phone: client.phone,
                        company: client.companyName,
                        status: client.status,
                        notesCount: ((_a = client.notes) === null || _a === void 0 ? void 0 : _a.length) || 0,
                        totalMatters: client.totalMatters || 0,
                    });
                }
                return `Client "${args.clientName}" not found.`;
            }
            if (functionName === "create_client") {
                const existingClient = yield Client_1.default.findOne({ email: args.email });
                if (existingClient) {
                    return `A client with email ${args.email} already exists.`;
                }
                const newClient = new Client_1.default({
                    name: args.name,
                    email: args.email,
                    phone: args.phone || "",
                    companyName: args.companyName || "",
                    status: args.status || "prospect",
                    notes: [],
                    totalMatters: 0,
                });
                yield newClient.save();
                return `Client "${args.name}" created successfully with email ${args.email}.`;
            }
            if (functionName === "update_client") {
                const client = yield Client_1.default.findOne({
                    name: { $regex: new RegExp(args.clientName, "i") },
                });
                if (!client) {
                    return `Client "${args.clientName}" not found.`;
                }
                if (args.newName)
                    client.name = args.newName;
                if (args.email)
                    client.email = args.email;
                if (args.phone)
                    client.phone = args.phone;
                if (args.status)
                    client.status = args.status;
                yield client.save();
                return `Client "${client.name}" updated successfully.`;
            }
            if (functionName === "add_client_note") {
                // Validate required args defensively (LLM tools can be inconsistent)
                if (!(args === null || args === void 0 ? void 0 : args.clientName) || typeof args.clientName !== "string") {
                    return "⚠️ Which client should I add the note to?";
                }
                if (!(args === null || args === void 0 ? void 0 : args.noteContent) ||
                    typeof args.noteContent !== "string" ||
                    !args.noteContent.trim()) {
                    return `⚠️ What note would you like to add to "${args.clientName}"?`;
                }
                const client = yield Client_1.default.findOne({
                    name: { $regex: new RegExp(args.clientName, "i") },
                });
                if (client) {
                    const noteContent = args.noteContent.trim();
                    client.notes.push({
                        content: noteContent,
                        author: "AI Assistant",
                        createdAt: new Date(),
                    });
                    yield client.save();
                    const clientId = client._id.toString();
                    return `✅ Note added to client "${client.name}": "${noteContent}". [View Client Notes →](/clients/${clientId})`;
                }
                return `Client "${args.clientName}" not found.`;
            }
            // ===== CASE TOOLS =====
            if (functionName === "list_cases") {
                const filter = {};
                if (args.status)
                    filter.status = args.status;
                if (args.priority)
                    filter.priority = args.priority;
                const cases = yield Case_1.default.find(filter)
                    .populate("client", "name")
                    .select("title caseNumber status priority deadline client");
                if (cases.length === 0) {
                    return "No cases found matching the criteria.";
                }
                return JSON.stringify(cases.map((c) => {
                    var _a;
                    return ({
                        id: c._id.toString(),
                        title: c.title,
                        caseNumber: c.caseNumber,
                        status: c.status,
                        priority: c.priority,
                        deadline: c.deadline,
                        client: ((_a = c.client) === null || _a === void 0 ? void 0 : _a.name) || "Unknown",
                        link: `/cases/${c._id.toString()}`,
                    });
                }));
            }
            if (functionName === "get_case_info") {
                const caseDoc = yield Case_1.default.findOne({
                    $or: [
                        { title: { $regex: new RegExp(args.caseIdentifier, "i") } },
                        { caseNumber: { $regex: new RegExp(args.caseIdentifier, "i") } },
                    ],
                })
                    .populate("client", "name")
                    .populate("assignedTeam", "name role");
                if (caseDoc) {
                    const caseId = caseDoc._id.toString();
                    const clientName = ((_b = caseDoc.client) === null || _b === void 0 ? void 0 : _b.name) || "Unknown";
                    const teamNames = ((_c = caseDoc.assignedTeam) === null || _c === void 0 ? void 0 : _c.map((m) => m.name).join(", ")) ||
                        "None";
                    const deadline = caseDoc.deadline
                        ? new Date(caseDoc.deadline).toLocaleDateString()
                        : "Not set";
                    return `📋 **Case: ${caseDoc.title}** (${caseDoc.caseNumber})
- **Status:** ${caseDoc.status}
- **Priority:** ${caseDoc.priority}
- **Client:** ${clientName}
- **Assigned Team:** ${teamNames}
- **Deadline:** ${deadline}
- **Description:** ${caseDoc.description || "No description"}

[View Case Details →](/cases/${caseId})`;
                }
                return `Case "${args.caseIdentifier}" not found.`;
            }
            if (functionName === "update_case_status") {
                const caseDoc = yield Case_1.default.findOne({
                    $or: [
                        { title: { $regex: new RegExp(args.caseIdentifier, "i") } },
                        { caseNumber: { $regex: new RegExp(args.caseIdentifier, "i") } },
                    ],
                });
                if (caseDoc) {
                    const oldStatus = caseDoc.status;
                    caseDoc.status = args.newStatus;
                    yield caseDoc.save();
                    const caseId = caseDoc._id.toString();
                    return `✅ Case "${caseDoc.title}" (${caseDoc.caseNumber}) status updated from "${oldStatus}" to "${args.newStatus}". [View Case →](/cases/${caseId})`;
                }
                return `Case "${args.caseIdentifier}" not found.`;
            }
            if (functionName === "create_case") {
                // Find the client
                const client = yield Client_1.default.findOne({
                    name: { $regex: new RegExp(args.clientName, "i") },
                });
                if (!client) {
                    return `Client "${args.clientName}" not found. Please create the client first or check the spelling.`;
                }
                // Generate a case number
                const caseCount = yield Case_1.default.countDocuments();
                const prefix = args.title.substring(0, 2).toUpperCase();
                const year = new Date().getFullYear();
                const caseNumber = `${prefix}-${year}-${String(caseCount + 1).padStart(3, "0")}`;
                const newCase = new Case_1.default({
                    title: args.title,
                    caseNumber: caseNumber,
                    client: client._id,
                    description: args.description || "",
                    priority: args.priority || "medium",
                    status: args.status || "intake",
                    assignedTeam: [],
                    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
                });
                yield newCase.save();
                // Update client's total matters
                client.totalMatters = (client.totalMatters || 0) + 1;
                yield client.save();
                const caseId = newCase._id.toString();
                return `✅ Case "${args.title}" (${caseNumber}) created successfully for client ${client.name}. Status: ${newCase.status}, Priority: ${newCase.priority}. [View Case →](/cases/${caseId})`;
            }
            // ===== TASK TOOLS =====
            if (functionName === "list_tasks") {
                const filter = {};
                if (args.status)
                    filter.status = args.status;
                if (args.priority)
                    filter.priority = args.priority;
                let tasks = yield Task_1.default.find(filter)
                    .populate("assignedTo", "name")
                    .populate("relatedCase", "title")
                    .select("title description status priority dueDate assignedTo relatedCase");
                // Filter by assignee name if provided
                if (args.assigneeName) {
                    tasks = tasks.filter((t) => {
                        var _a, _b;
                        return (_b = (_a = t.assignedTo) === null || _a === void 0 ? void 0 : _a.name) === null || _b === void 0 ? void 0 : _b.toLowerCase().includes(args.assigneeName.toLowerCase());
                    });
                }
                if (tasks.length === 0) {
                    return "No tasks found matching the criteria.";
                }
                return JSON.stringify(tasks.map((t) => {
                    var _a, _b;
                    return ({
                        title: t.title,
                        description: t.description,
                        status: t.status,
                        priority: t.priority,
                        dueDate: t.dueDate,
                        assignedTo: ((_a = t.assignedTo) === null || _a === void 0 ? void 0 : _a.name) || "Unassigned",
                        relatedCase: ((_b = t.relatedCase) === null || _b === void 0 ? void 0 : _b.title) || "None",
                    });
                }));
            }
            if (functionName === "create_task") {
                // Find assignee
                const assignee = yield User_1.default.findOne({
                    name: { $regex: new RegExp(args.assigneeName, "i") },
                });
                if (!assignee) {
                    return `Team member "${args.assigneeName}" not found. Cannot create task.`;
                }
                // Find related case if provided
                let relatedCaseId = null;
                if (args.caseName) {
                    const relatedCase = yield Case_1.default.findOne({
                        title: { $regex: new RegExp(args.caseName, "i") },
                    });
                    if (relatedCase) {
                        relatedCaseId = relatedCase._id;
                    }
                }
                const newTask = new Task_1.default({
                    title: args.title,
                    description: args.description || "",
                    assignedTo: assignee._id,
                    priority: args.priority || "medium",
                    status: "pending",
                    dueDate: args.dueDate
                        ? new Date(args.dueDate)
                        : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                    relatedCase: relatedCaseId,
                });
                yield newTask.save();
                return `Task "${args.title}" created and assigned to ${assignee.name}.`;
            }
            if (functionName === "update_task_status") {
                const task = yield Task_1.default.findOne({
                    title: { $regex: new RegExp(args.taskTitle, "i") },
                });
                if (task) {
                    const oldStatus = task.status;
                    task.status = args.newStatus;
                    yield task.save();
                    return `Task "${task.title}" status updated from "${oldStatus}" to "${args.newStatus}".`;
                }
                return `Task "${args.taskTitle}" not found.`;
            }
            // ===== TEAM TOOLS =====
            if (functionName === "list_team_members") {
                const filter = {};
                if (args.role)
                    filter.role = args.role;
                const members = yield User_1.default.find(filter).select("name email role specialties");
                if (members.length === 0) {
                    return "No team members found matching the criteria.";
                }
                return JSON.stringify(members.map((m) => ({
                    name: m.name,
                    email: m.email,
                    role: m.role,
                    specialties: m.specialties || [],
                })));
            }
            if (functionName === "get_team_member_info") {
                const member = yield User_1.default.findOne({
                    name: { $regex: new RegExp(args.memberName, "i") },
                });
                if (member) {
                    // Get assigned tasks count
                    const tasksCount = yield Task_1.default.countDocuments({ assignedTo: member._id });
                    // Get assigned cases count
                    const casesCount = yield Case_1.default.countDocuments({
                        assignedTeam: member._id,
                    });
                    return JSON.stringify({
                        name: member.name,
                        email: member.email,
                        role: member.role,
                        specialties: member.specialties || [],
                        assignedTasksCount: tasksCount,
                        assignedCasesCount: casesCount,
                    });
                }
                return `Team member "${args.memberName}" not found.`;
            }
            // ===== DASHBOARD TOOLS =====
            if (functionName === "get_dashboard_summary") {
                const [clientsCount, casesCount, tasksCount, teamCount] = yield Promise.all([
                    Client_1.default.countDocuments(),
                    Case_1.default.countDocuments(),
                    Task_1.default.countDocuments(),
                    User_1.default.countDocuments(),
                ]);
                const [activeCases, pendingTasks, highPriorityTasks] = yield Promise.all([
                    Case_1.default.countDocuments({ status: { $ne: "closed" } }),
                    Task_1.default.countDocuments({ status: "pending" }),
                    Task_1.default.countDocuments({ priority: "high", status: { $ne: "completed" } }),
                ]);
                return JSON.stringify({
                    totalClients: clientsCount,
                    totalCases: casesCount,
                    totalTasks: tasksCount,
                    totalTeamMembers: teamCount,
                    activeCases: activeCases,
                    pendingTasks: pendingTasks,
                    highPriorityTasks: highPriorityTasks,
                });
            }
            return `Unknown function: ${functionName}`;
        }
        catch (error) {
            return `Error executing ${functionName}: ${error.message}`;
        }
    });
}
const handleChat = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { messages } = req.body;
        // --- Deterministic guardrails for various workflows ---
        // Local models can skip tools or hallucinate success; for these workflows we
        // provide a reliable, state-lite experience based on the chat history.
        const lastMsg = Array.isArray(messages)
            ? messages[messages.length - 1]
            : null;
        const lastUserContent = (lastMsg === null || lastMsg === void 0 ? void 0 : lastMsg.role) === "user" && typeof (lastMsg === null || lastMsg === void 0 ? void 0 : lastMsg.content) === "string"
            ? lastMsg.content
            : null;
        // Helper to get previous assistant message
        const getPrevAssistantContent = () => {
            if (!Array.isArray(messages) || messages.length < 2)
                return null;
            const prev = messages[messages.length - 2];
            return (prev === null || prev === void 0 ? void 0 : prev.role) === "assistant" && typeof (prev === null || prev === void 0 ? void 0 : prev.content) === "string"
                ? prev.content
                : null;
        };
        // ===== SMART NAVIGATION FOR LIST QUERIES =====
        // Redirect users to appropriate pages instead of showing text lists
        if (lastUserContent) {
            const t = lastUserContent.toLowerCase().trim();
            // List all clients
            if (/^(show|list|get|display|view)\s+(me\s+)?(all\s+)?(the\s+)?clients/i.test(t) ||
                /what\s+clients\s+(do\s+we\s+have|are\s+there)/i.test(t)) {
                const clientCount = yield Client_1.default.countDocuments();
                return res.json({
                    role: "assistant",
                    content: `You have **${clientCount} clients** in the system. [View All Clients →](/clients)`,
                });
            }
            // List clients with filter (active, inactive, prospect)
            const clientFilterMatch = t.match(/^(show|list|get|display|view)\s+(me\s+)?(all\s+)?(the\s+)?(active|inactive|prospect)\s+clients/i);
            if (clientFilterMatch) {
                const status = clientFilterMatch[5].toLowerCase();
                const count = yield Client_1.default.countDocuments({ status });
                return res.json({
                    role: "assistant",
                    content: `You have **${count} ${status} clients**. [View ${status.charAt(0).toUpperCase() + status.slice(1)} Clients →](/clients?status=${status})`,
                });
            }
            // List all cases
            if (/^(show|list|get|display|view)\s+(me\s+)?(all\s+)?(the\s+)?cases/i.test(t) ||
                /what\s+cases\s+(do\s+we\s+have|are\s+there)/i.test(t)) {
                const caseCount = yield Case_1.default.countDocuments();
                const activeCases = yield Case_1.default.countDocuments({
                    status: { $ne: "closed" },
                });
                return res.json({
                    role: "assistant",
                    content: `You have **${caseCount} cases** total (${activeCases} active). [View All Cases →](/cases)`,
                });
            }
            // List cases with filter (priority or status)
            const caseFilterMatch = t.match(/^(show|list|get|display|view)\s+(me\s+)?(all\s+)?(the\s+)?(high|medium|low|intake|discovery|trial|closed)(\s+priority)?\s+cases/i);
            if (caseFilterMatch) {
                const filterValue = caseFilterMatch[5].toLowerCase();
                const isPriority = ["high", "medium", "low"].includes(filterValue);
                const filter = isPriority
                    ? { priority: filterValue }
                    : { status: filterValue };
                const count = yield Case_1.default.countDocuments(filter);
                const filterType = isPriority ? "priority" : "status";
                const queryParam = isPriority
                    ? `priority=${filterValue}`
                    : `status=${filterValue}`;
                return res.json({
                    role: "assistant",
                    content: `You have **${count} ${filterValue} ${filterType} cases**. [View ${filterValue.charAt(0).toUpperCase() + filterValue.slice(1)} Cases →](/cases?${queryParam})`,
                });
            }
            // List all tasks
            if (/^(show|list|get|display|view)\s+(me\s+)?(all\s+)?(the\s+)?tasks/i.test(t) ||
                /what\s+tasks\s+(do\s+we\s+have|are\s+there)/i.test(t)) {
                const taskCount = yield Task_1.default.countDocuments();
                const pendingTasks = yield Task_1.default.countDocuments({ status: "pending" });
                return res.json({
                    role: "assistant",
                    content: `You have **${taskCount} tasks** total (${pendingTasks} pending). [View All Tasks →](/tasks)`,
                });
            }
            // List tasks with filter
            const taskFilterMatch = t.match(/^(show|list|get|display|view)\s+(me\s+)?(all\s+)?(the\s+)?(high|medium|low|pending|in-progress|completed)(\s+priority)?\s+tasks/i);
            if (taskFilterMatch) {
                const filterValue = taskFilterMatch[5].toLowerCase();
                const isPriority = ["high", "medium", "low"].includes(filterValue);
                const filter = isPriority
                    ? { priority: filterValue }
                    : { status: filterValue };
                const count = yield Task_1.default.countDocuments(filter);
                const filterType = isPriority ? "priority" : "status";
                const queryParam = isPriority
                    ? `priority=${filterValue}`
                    : `status=${filterValue}`;
                return res.json({
                    role: "assistant",
                    content: `You have **${count} ${filterValue} ${filterType} tasks**. [View ${filterValue.charAt(0).toUpperCase() + filterValue.slice(1)} Tasks →](/tasks?${queryParam})`,
                });
            }
            // List all team members
            if (/^(show|list|get|display|view)\s+(me\s+)?(all\s+)?(the\s+)?(team\s*members?|team|staff|employees)/i.test(t) ||
                /who('s| is)\s+(on\s+)?(the\s+)?team/i.test(t)) {
                const teamCount = yield User_1.default.countDocuments();
                return res.json({
                    role: "assistant",
                    content: `You have **${teamCount} team members**. [View Team Page →](/team)`,
                });
            }
            // List team members with role filter
            const teamFilterMatch = t.match(/^(show|list|get|display|view)\s+(me\s+)?(all\s+)?(the\s+)?(partners?|associates?|paralegals?|staff)/i);
            if (teamFilterMatch) {
                const roleInput = teamFilterMatch[5].toLowerCase();
                // Normalize role (remove trailing 's' for plural)
                const role = roleInput.replace(/s$/, "");
                const count = yield User_1.default.countDocuments({
                    role: { $regex: new RegExp(`^${role}`, "i") },
                });
                return res.json({
                    role: "assistant",
                    content: `You have **${count} ${role}(s)** on the team. [View ${role.charAt(0).toUpperCase() + role.slice(1)}s →](/team?role=${role})`,
                });
            }
        }
        // ===== MULTI-TURN CONVERSATIONAL NOTE-TAKING =====
        // Helper functions for note-taking
        const extractClientNameFromAddNoteRequest = (text) => {
            const cleaned = text.trim();
            // Common: "add a note in abc corp client" / "add note to abc corp"
            const m = cleaned.match(/add\s+(?:a\s+)?note\s+(?:in|to|for)\s+(?:the\s+)?(.+?)(?:\s+client)?\s*$/i);
            if (!(m === null || m === void 0 ? void 0 : m[1]))
                return null;
            const name = m[1]
                .trim()
                .replace(/\s+client\s*$/i, "")
                .trim();
            return name.length ? name : null;
        };
        const extractNoteWithContent = (text) => {
            // Pattern: "add a note to ClientName: content" or "add note to ClientName that says content"
            const colonMatch = text.match(/add\s+(?:a\s+)?note\s+(?:in|to|for)\s+(?:the\s+)?(.+?):\s*(.+)/i);
            if ((colonMatch === null || colonMatch === void 0 ? void 0 : colonMatch[1]) && (colonMatch === null || colonMatch === void 0 ? void 0 : colonMatch[2])) {
                return {
                    clientName: colonMatch[1].replace(/\s+client\s*$/i, "").trim(),
                    content: colonMatch[2].trim(),
                };
            }
            return null;
        };
        const addNoteRequestMissingContent = (text) => {
            const t = text.toLowerCase();
            if (!t.includes("note"))
                return false;
            if (!t.includes("add"))
                return false;
            // If they include quotes/colon or phrasing that usually carries content, assume content exists.
            if (t.includes('"') ||
                t.includes("'") ||
                t.includes(":") ||
                t.includes("that says") ||
                t.includes("saying") ||
                t.includes("content")) {
                return false;
            }
            return true;
        };
        const isAmbiguousNoteRequest = (text) => {
            const t = text.toLowerCase().trim();
            // "add a note" or "add note" without specifying client/case
            return /^add\s+(?:a\s+)?note\s*$/i.test(t);
        };
        // Scenario A: Completely ambiguous "add a note" request
        if (lastUserContent && isAmbiguousNoteRequest(lastUserContent)) {
            return res.json({
                role: "assistant",
                content: "Would you like to add a note to a **client** or a **case**?",
            });
        }
        // Handle response to "client or case?" question
        const prevContent = getPrevAssistantContent();
        if (lastUserContent &&
            (prevContent === null || prevContent === void 0 ? void 0 : prevContent.includes("Would you like to add a note to a **client** or a **case**?"))) {
            const t = lastUserContent.toLowerCase().trim();
            if (t.includes("client") || t === "client") {
                return res.json({
                    role: "assistant",
                    content: "Which client would you like to add the note to?",
                });
            }
            if (t.includes("case") || t === "case") {
                return res.json({
                    role: "assistant",
                    content: "Adding notes to cases is not yet supported. Would you like to add a note to a client instead?",
                });
            }
        }
        // Handle response to "Which client?" question
        if (lastUserContent &&
            prevContent === "Which client would you like to add the note to?") {
            const clientName = lastUserContent.trim();
            // Verify client exists
            const client = yield Client_1.default.findOne({
                name: { $regex: new RegExp(clientName, "i") },
            });
            if (client) {
                return res.json({
                    role: "assistant",
                    content: `What note would you like to add to "${client.name}"?`,
                });
            }
            else {
                return res.json({
                    role: "assistant",
                    content: `Client "${clientName}" not found. Please check the name and try again, or [View All Clients →](/clients) to see available clients.`,
                });
            }
        }
        // Scenario C: Complete information provided (note with content)
        if (lastUserContent) {
            const noteWithContent = extractNoteWithContent(lastUserContent);
            if (noteWithContent) {
                const result = yield executeTool("add_client_note", {
                    clientName: noteWithContent.clientName,
                    noteContent: noteWithContent.content,
                });
                return res.json({ role: "assistant", content: result });
            }
        }
        // Scenario B: Partial information (client name but no content)
        if (lastUserContent) {
            const clientName = extractClientNameFromAddNoteRequest(lastUserContent);
            if (clientName && addNoteRequestMissingContent(lastUserContent)) {
                // Verify client exists first
                const client = yield Client_1.default.findOne({
                    name: { $regex: new RegExp(clientName, "i") },
                });
                if (client) {
                    return res.json({
                        role: "assistant",
                        content: `What note would you like to add to "${client.name}"?`,
                    });
                }
                else {
                    return res.json({
                        role: "assistant",
                        content: `Client "${clientName}" not found. Please check the name and try again, or [View All Clients →](/clients) to see available clients.`,
                    });
                }
            }
        }
        // Handle response to "What note would you like to add?" question
        if (lastUserContent && prevContent) {
            const prevMatch = prevContent.match(/What note would you like to add to\s+"([^"]+)"\?/i);
            if (prevMatch === null || prevMatch === void 0 ? void 0 : prevMatch[1]) {
                const clientName = prevMatch[1];
                const result = yield executeTool("add_client_note", {
                    clientName,
                    noteContent: lastUserContent,
                });
                return res.json({ role: "assistant", content: result });
            }
        }
        // ===== MULTI-TURN TASK CREATION =====
        const isAmbiguousTaskRequest = (text) => {
            const t = text.toLowerCase().trim();
            return /^(create|add|make)\s+(?:a\s+)?(?:new\s+)?task\s*$/i.test(t);
        };
        if (lastUserContent && isAmbiguousTaskRequest(lastUserContent)) {
            return res.json({
                role: "assistant",
                content: "I'd be happy to create a task! What should the task title be?",
            });
        }
        // Handle task title response
        if (lastUserContent &&
            prevContent ===
                "I'd be happy to create a task! What should the task title be?") {
            return res.json({
                role: "assistant",
                content: `Got it! Task: "${lastUserContent}". Who should this task be assigned to?`,
            });
        }
        // Handle task assignee response
        if (lastUserContent && prevContent) {
            const taskTitleMatch = prevContent.match(/Got it! Task: "([^"]+)"\. Who should this task be assigned to\?/i);
            if (taskTitleMatch === null || taskTitleMatch === void 0 ? void 0 : taskTitleMatch[1]) {
                const taskTitle = taskTitleMatch[1];
                const assigneeName = lastUserContent.trim();
                // Verify assignee exists
                const assignee = yield User_1.default.findOne({
                    name: { $regex: new RegExp(assigneeName, "i") },
                });
                if (assignee) {
                    return res.json({
                        role: "assistant",
                        content: `Task "${taskTitle}" will be assigned to ${assignee.name}. What priority should it have? (high, medium, or low)`,
                    });
                }
                else {
                    return res.json({
                        role: "assistant",
                        content: `Team member "${assigneeName}" not found. [View Team Page →](/team) to see available team members. Who should this task be assigned to?`,
                    });
                }
            }
        }
        // Handle task assignee retry after "not found" error
        if (lastUserContent && prevContent) {
            const notFoundMatch = prevContent.match(/Team member "[^"]+" not found\..*Who should this task be assigned to\?/i);
            if (notFoundMatch) {
                // Look back in history to find the task title
                const historyMessages = messages || [];
                let taskTitle = "";
                for (let i = historyMessages.length - 1; i >= 0; i--) {
                    const msg = historyMessages[i];
                    if (msg.role === "assistant") {
                        const titleMatch = (msg.content || "").match(/Got it! Task: "([^"]+)"\./i);
                        if (titleMatch === null || titleMatch === void 0 ? void 0 : titleMatch[1]) {
                            taskTitle = titleMatch[1];
                            break;
                        }
                    }
                }
                if (taskTitle) {
                    const assigneeName = lastUserContent.trim();
                    const assignee = yield User_1.default.findOne({
                        name: { $regex: new RegExp(assigneeName, "i") },
                    });
                    if (assignee) {
                        return res.json({
                            role: "assistant",
                            content: `Task "${taskTitle}" will be assigned to ${assignee.name}. What priority should it have? (high, medium, or low)`,
                        });
                    }
                    else {
                        return res.json({
                            role: "assistant",
                            content: `Team member "${assigneeName}" not found. [View Team Page →](/team) to see available team members. Who should this task be assigned to?`,
                        });
                    }
                }
            }
        }
        // Handle task priority response
        if (lastUserContent && prevContent) {
            const taskAssigneeMatch = prevContent.match(/Task "([^"]+)" will be assigned to ([^.]+)\. What priority should it have\?/i);
            if ((taskAssigneeMatch === null || taskAssigneeMatch === void 0 ? void 0 : taskAssigneeMatch[1]) && (taskAssigneeMatch === null || taskAssigneeMatch === void 0 ? void 0 : taskAssigneeMatch[2])) {
                const taskTitle = taskAssigneeMatch[1];
                const assigneeName = taskAssigneeMatch[2];
                const priority = lastUserContent.toLowerCase().trim();
                if (["high", "medium", "low"].includes(priority)) {
                    const result = yield executeTool("create_task", {
                        title: taskTitle,
                        assigneeName: assigneeName,
                        priority: priority,
                    });
                    return res.json({
                        role: "assistant",
                        content: `✅ Task "${taskTitle}" created and assigned to ${assigneeName} with ${priority} priority. [View Tasks →](/tasks)`,
                    });
                }
                else {
                    return res.json({
                        role: "assistant",
                        content: `Please choose a priority: **high**, **medium**, or **low**.`,
                    });
                }
            }
        }
        // ===== MULTI-TURN CASE STATUS UPDATE =====
        const isAmbiguousCaseUpdateRequest = (text) => {
            const t = text.toLowerCase().trim();
            return /^(update|change|modify)\s+(?:a\s+)?(?:the\s+)?case\s*$/i.test(t);
        };
        if (lastUserContent && isAmbiguousCaseUpdateRequest(lastUserContent)) {
            return res.json({
                role: "assistant",
                content: "Which case would you like to update? Please provide the case title or case number.",
            });
        }
        // Handle case selection for update
        if (lastUserContent &&
            prevContent ===
                "Which case would you like to update? Please provide the case title or case number.") {
            const caseIdentifier = lastUserContent.trim();
            const caseDoc = yield Case_1.default.findOne({
                $or: [
                    { title: { $regex: new RegExp(caseIdentifier, "i") } },
                    { caseNumber: { $regex: new RegExp(caseIdentifier, "i") } },
                ],
            });
            if (caseDoc) {
                return res.json({
                    role: "assistant",
                    content: `Found case "${caseDoc.title}" (${caseDoc.caseNumber}). Current status: **${caseDoc.status}**. What would you like to change the status to? (intake, discovery, trial, or closed)`,
                });
            }
            else {
                return res.json({
                    role: "assistant",
                    content: `Case "${caseIdentifier}" not found. [View Cases Page →](/cases) to see all cases.`,
                });
            }
        }
        // Handle case status update response
        if (lastUserContent && prevContent) {
            const caseStatusMatch = prevContent.match(/Found case "([^"]+)" \(([^)]+)\)\. Current status: \*\*([^*]+)\*\*\. What would you like to change the status to\?/i);
            if ((caseStatusMatch === null || caseStatusMatch === void 0 ? void 0 : caseStatusMatch[1]) && (caseStatusMatch === null || caseStatusMatch === void 0 ? void 0 : caseStatusMatch[2])) {
                const caseTitle = caseStatusMatch[1];
                const newStatus = lastUserContent.toLowerCase().trim();
                if (["intake", "discovery", "trial", "closed"].includes(newStatus)) {
                    const result = yield executeTool("update_case_status", {
                        caseIdentifier: caseTitle,
                        newStatus: newStatus,
                    });
                    return res.json({ role: "assistant", content: result });
                }
                else {
                    return res.json({
                        role: "assistant",
                        content: `Please choose a valid status: **intake**, **discovery**, **trial**, or **closed**.`,
                    });
                }
            }
        }
        // 1. Call Ollama with tools
        const aiResponse = yield (0, aiService_1.chatWithAI)(messages, tools);
        const responseMessage = aiResponse.message;
        // 2. Check for tool calls
        if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
            const toolCalls = responseMessage.tool_calls;
            const toolResults = [];
            // Execute all tool calls
            for (const toolCall of toolCalls) {
                const toolCallId = toolCall.id; // Extract tool_call_id for Groq compatibility
                const functionName = toolCall.function.name;
                const args = toolCall.function.arguments;
                // Execute the tool
                const result = yield executeTool(functionName, args);
                toolResults.push(result);
                // Append tool result to messages
                messages.push(responseMessage); // Add the assistant's tool call message
                messages.push(Object.assign({ role: "tool", content: result, name: functionName }, (toolCallId && { tool_call_id: toolCallId })));
            }
            // --- Deterministic response for tools with markdown links ---
            // Local LLMs often lose/summarize markdown links when generating final responses.
            // For tool results that contain success indicators AND markdown links, return
            // the tool result directly to ensure links are preserved for the frontend.
            const combinedResult = toolResults.join("\n\n");
            const hasSuccessIndicator = combinedResult.includes("✅");
            const hasMarkdownLink = /\[[^\]]+\]\([^)]+\)/.test(combinedResult);
            if (hasSuccessIndicator && hasMarkdownLink) {
                // Return the tool result directly to preserve markdown links
                return res.json({ role: "assistant", content: combinedResult });
            }
            // 3. Call Ollama again with tool results to get final response
            const finalResponse = yield (0, aiService_1.chatWithAI)(messages, tools);
            res.json(finalResponse.message);
        }
        else {
            // No tool call, just return text response
            res.json(responseMessage);
        }
    }
    catch (error) {
        console.error("AI Chat Error:", error);
        res.status(500).json({ message: error.message });
    }
});
exports.handleChat = handleChat;
