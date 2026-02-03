import express from "express";
import {
  getCases,
  getCaseById,
  createCase,
  updateCase,
  updateCaseStatus,
  updateCaseStage,
  deleteCase,
} from "../controllers/caseController";

const router = express.Router();

router.get("/", getCases);
router.get("/:id", getCaseById);
router.post("/", createCase);
router.put("/:id", updateCase);
router.patch("/:id/status", updateCaseStatus);
router.patch("/:id/stage", updateCaseStage);
router.delete("/:id", deleteCase);

export default router;
