import {Request, Response} from "express";
import Client from "../models/Client";

export const getClients = async (req: Request, res: Response) => {
  try {
    const clients = await Client.find().sort({createdAt: -1});
    res.json(clients);
  } catch (error: any) {
    res.status(500).json({message: error.message});
  }
};

export const getClientById = async (req: Request, res: Response) => {
  try {
    const client = await Client.findById(req.params.id);
    if (client) {
      res.json(client);
    } else {
      res.status(404).json({message: "Client not found"});
    }
  } catch (error: any) {
    res.status(500).json({message: error.message});
  }
};

export const createClient = async (req: Request, res: Response) => {
  try {
    const client = new Client(req.body);
    const createdClient = await client.save();
    res.status(201).json(createdClient);
  } catch (error: any) {
    res.status(400).json({message: error.message});
  }
};

export const updateClient = async (req: Request, res: Response) => {
  try {
    const client = await Client.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (client) {
      res.json(client);
    } else {
      res.status(404).json({message: "Client not found"});
    }
  } catch (error: any) {
    res.status(400).json({message: error.message});
  }
};

export const deleteClient = async (req: Request, res: Response) => {
  try {
    const client = await Client.findByIdAndDelete(req.params.id);
    if (client) {
      res.json({message: "Client deleted successfully"});
    } else {
      res.status(404).json({message: "Client not found"});
    }
  } catch (error: any) {
    res.status(500).json({message: error.message});
  }
};

export const addNote = async (req: Request, res: Response) => {
  try {
    const client = await Client.findById(req.params.id);
    if (client) {
      const {content, author} = req.body;
      client.notes.push({content, author, createdAt: new Date()});
      await client.save();
      res.json(client);
    } else {
      res.status(404).json({message: "Client not found"});
    }
  } catch (error: any) {
    res.status(400).json({message: error.message});
  }
};
