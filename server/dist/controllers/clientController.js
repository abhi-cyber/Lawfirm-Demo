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
exports.addNote = exports.deleteClient = exports.updateClient = exports.createClient = exports.getClientById = exports.getClients = void 0;
const Client_1 = __importDefault(require("../models/Client"));
const getClients = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clients = yield Client_1.default.find().sort({ createdAt: -1 });
        res.json(clients);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getClients = getClients;
const getClientById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const client = yield Client_1.default.findById(req.params.id);
        if (client) {
            res.json(client);
        }
        else {
            res.status(404).json({ message: "Client not found" });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getClientById = getClientById;
const createClient = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const client = new Client_1.default(req.body);
        const createdClient = yield client.save();
        res.status(201).json(createdClient);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.createClient = createClient;
const updateClient = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const client = yield Client_1.default.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (client) {
            res.json(client);
        }
        else {
            res.status(404).json({ message: "Client not found" });
        }
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.updateClient = updateClient;
const deleteClient = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const client = yield Client_1.default.findByIdAndDelete(req.params.id);
        if (client) {
            res.json({ message: "Client deleted successfully" });
        }
        else {
            res.status(404).json({ message: "Client not found" });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.deleteClient = deleteClient;
const addNote = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const client = yield Client_1.default.findById(req.params.id);
        if (client) {
            const { content, author } = req.body;
            client.notes.push({ content, author, createdAt: new Date() });
            yield client.save();
            res.json(client);
        }
        else {
            res.status(404).json({ message: "Client not found" });
        }
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.addNote = addNote;
