"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const clientController_1 = require("../controllers/clientController");
const router = express_1.default.Router();
router.get("/", clientController_1.getClients);
router.get("/:id", clientController_1.getClientById);
router.post("/", clientController_1.createClient);
router.put("/:id", clientController_1.updateClient);
router.delete("/:id", clientController_1.deleteClient);
router.post("/:id/notes", clientController_1.addNote);
exports.default = router;
