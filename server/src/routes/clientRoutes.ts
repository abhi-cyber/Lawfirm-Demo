import express from "express";
import {
  getClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  addNote,
} from "../controllers/clientController";

const router = express.Router();

router.get("/", getClients);
router.get("/:id", getClientById);
router.post("/", createClient);
router.put("/:id", updateClient);
router.delete("/:id", deleteClient);
router.post("/:id/notes", addNote);

export default router;
