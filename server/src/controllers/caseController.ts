import {Request, Response} from "express";
import Case from "../models/Case";

export const getCases = async (req: Request, res: Response) => {
  try {
    const filter: any = {};
    if (req.query.client) {
      filter.client = req.query.client;
    }
    // Populate client name and assigned team details
    const cases = await Case.find(filter)
      .populate("client", "name")
      .populate("assignedTeam", "name avatarUrl")
      .sort({createdAt: -1});
    res.json(cases);
  } catch (error: any) {
    res.status(500).json({message: error.message});
  }
};

export const getCaseById = async (req: Request, res: Response) => {
  try {
    const caseItem = await Case.findById(req.params.id)
      .populate("client", "name email phone")
      .populate("assignedTeam", "name email role avatarUrl");

    if (!caseItem) {
      return res.status(404).json({message: "Case not found"});
    }
    res.json(caseItem);
  } catch (error: any) {
    res.status(500).json({message: error.message});
  }
};

export const createCase = async (req: Request, res: Response) => {
  try {
    const newCase = new Case(req.body);
    const createdCase = await newCase.save();
    res.status(201).json(createdCase);
  } catch (error: any) {
    res.status(400).json({message: error.message});
  }
};

export const updateCase = async (req: Request, res: Response) => {
  try {
    const caseItem = await Case.findById(req.params.id);
    if (!caseItem) {
      return res.status(404).json({message: "Case not found"});
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
        (caseItem as any)[field] = req.body[field];
      }
    });

    const updatedCase = await caseItem.save();
    const populatedCase = await Case.findById(updatedCase._id)
      .populate("client", "name")
      .populate("assignedTeam", "name avatarUrl");
    res.json(populatedCase);
  } catch (error: any) {
    res.status(400).json({message: error.message});
  }
};

export const updateCaseStatus = async (req: Request, res: Response) => {
  try {
    const {status} = req.body;
    const caseItem = await Case.findById(req.params.id);
    if (!caseItem) {
      return res.status(404).json({message: "Case not found"});
    }
    caseItem.status = status;
    const updatedCase = await caseItem.save();
    res.json(updatedCase);
  } catch (error: any) {
    res.status(400).json({message: error.message});
  }
};

export const updateCaseStage = async (req: Request, res: Response) => {
  try {
    const {stage} = req.body;
    const caseItem = await Case.findById(req.params.id);
    if (caseItem) {
      caseItem.stage = stage;
      const updatedCase = await caseItem.save();
      res.json(updatedCase);
    } else {
      res.status(404).json({message: "Case not found"});
    }
  } catch (error: any) {
    res.status(400).json({message: error.message});
  }
};

export const deleteCase = async (req: Request, res: Response) => {
  try {
    const caseItem = await Case.findById(req.params.id);
    if (!caseItem) {
      return res.status(404).json({message: "Case not found"});
    }
    await Case.findByIdAndDelete(req.params.id);
    res.json({message: "Case deleted successfully"});
  } catch (error: any) {
    res.status(500).json({message: error.message});
  }
};
