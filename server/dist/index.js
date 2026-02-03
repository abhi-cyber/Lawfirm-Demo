"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = __importDefault(require("./config/db"));
dotenv_1.default.config();
// Connect to Database
(0, db_1.default)();
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const clientRoutes_1 = __importDefault(require("./routes/clientRoutes"));
const caseRoutes_1 = __importDefault(require("./routes/caseRoutes"));
const taskRoutes_1 = __importDefault(require("./routes/taskRoutes"));
const aiRoutes_1 = __importDefault(require("./routes/aiRoutes"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5001;
// CORS configuration - allow localhost for dev and Netlify for production
const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    process.env.FRONTEND_URL, // Set this in production (e.g., https://abc-law-firm.netlify.app)
].filter(Boolean);
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin)
            return callback(null, true);
        // Allow if origin is in the allowed list or matches netlify.app pattern
        if (allowedOrigins.includes(origin) || origin.endsWith(".netlify.app")) {
            return callback(null, true);
        }
        callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
}));
app.use(express_1.default.json());
app.use("/api/users", userRoutes_1.default);
app.use("/api/clients", clientRoutes_1.default);
app.use("/api/cases", caseRoutes_1.default);
app.use("/api/tasks", taskRoutes_1.default);
app.use("/api/ai", aiRoutes_1.default);
app.get("/", (req, res) => {
    res.send("ABC Law Firm Management System API Running");
});
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
