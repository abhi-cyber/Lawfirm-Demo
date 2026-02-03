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
exports.deleteCase = exports.updateCaseStage = exports.updateCaseStatus = exports.updateCase = exports.createCase = exports.getCaseById = exports.getCases = void 0;
const Case_1 = __importDefault(require("../models/Case"));
const getCases = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const filter = {};
        if (req.query.client) {
            filter.client = req.query.client;
        }
        // Populate client name and assigned team details
        const cases = yield Case_1.default.find(filter)
            .populate("client", "name")
            .populate("assignedTeam", "name avatarUrl")
            .sort({ createdAt: -1 });
        res.json(cases);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getCases = getCases;
const getCaseById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const caseItem = yield Case_1.default.findById(req.params.id)
            .populate("client", "name email phone")
            .populate("assignedTeam", "name email role avatarUrl");
        if (!caseItem) {
            return res.status(404).json({ message: "Case not found" });
        }
        res.json(caseItem);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getCaseById = getCaseById;
const createCase = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const newCase = new Case_1.default(req.body);
        const createdCase = yield newCase.save();
        res.status(201).json(createdCase);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.createCase = createCase;
const updateCase = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const caseItem = yield Case_1.default.findById(req.params.id);
        if (!caseItem) {
            return res.status(404).json({ message: "Case not found" });
        }
        // Update allowed fields
        const allowedFields = [
            "title",
            "caseNumber",
            "client",
            "assignedTeam",
            "status",
            "priority",
            "stage",
            "deadline",
            "description",
        ];
        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                caseItem[field] = req.body[field];
            }
        });
        const updatedCase = yield caseItem.save();
        const populatedCase = yield Case_1.default.findById(updatedCase._id)
            .populate("client", "name")
            .populate("assignedTeam", "name avatarUrl");
        res.json(populatedCase);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.updateCase = updateCase;
const updateCaseStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status } = req.body;
        const caseItem = yield Case_1.default.findById(req.params.id);
        if (!caseItem) {
            return res.status(404).json({ message: "Case not found" });
        }
        caseItem.status = status;
        const updatedCase = yield caseItem.save();
        res.json(updatedCase);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.updateCaseStatus = updateCaseStatus;
const updateCaseStage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { stage } = req.body;
        const caseItem = yield Case_1.default.findById(req.params.id);
        if (caseItem) {
            caseItem.stage = stage;
            const updatedCase = yield caseItem.save();
            res.json(updatedCase);
        }
        else {
            res.status(404).json({ message: "Case not found" });
        }
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.updateCaseStage = updateCaseStage;
const deleteCase = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const caseItem = yield Case_1.default.findById(req.params.id);
        if (!caseItem) {
            return res.status(404).json({ message: "Case not found" });
        }
        yield Case_1.default.findByIdAndDelete(req.params.id);
        res.json({ message: "Case deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.deleteCase = deleteCase;
