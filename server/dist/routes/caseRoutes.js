"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const caseController_1 = require("../controllers/caseController");
const router = express_1.default.Router();
router.get("/", caseController_1.getCases);
router.get("/:id", caseController_1.getCaseById);
router.post("/", caseController_1.createCase);
router.put("/:id", caseController_1.updateCase);
router.patch("/:id/status", caseController_1.updateCaseStatus);
router.patch("/:id/stage", caseController_1.updateCaseStage);
router.delete("/:id", caseController_1.deleteCase);
exports.default = router;
