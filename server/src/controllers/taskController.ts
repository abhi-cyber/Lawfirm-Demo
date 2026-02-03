import {Request, Response} from "express";
import Task from "../models/Task";

export const getTasks = async (req: Request, res: Response) => {
  try {
    const tasks = await Task.find()
      .populate("assignedTo", "name email role")
      .populate("relatedCase", "title caseNumber");
    res.json(tasks);
  } catch (error) {
    res.status(500).json({message: "Server Error", error});
  }
};

export const createTask = async (req: Request, res: Response) => {
  try {
    const newTask = new Task(req.body);
    const savedTask = await newTask.save();
    res.status(201).json(savedTask);
  } catch (error) {
    res.status(400).json({message: "Error creating task", error});
  }
};

export const updateTask = async (req: Request, res: Response) => {
  try {
    const {id} = req.params;
    const updatedTask = await Task.findByIdAndUpdate(id, req.body, {new: true})
      .populate("assignedTo", "name email role")
      .populate("relatedCase", "title caseNumber");

    if (!updatedTask) {
      return res.status(404).json({message: "Task not found"});
    }

    res.json(updatedTask);
  } catch (error) {
    res.status(400).json({message: "Error updating task", error});
  }
};

export const deleteTask = async (req: Request, res: Response) => {
  try {
    const {id} = req.params;
    const deletedTask = await Task.findByIdAndDelete(id);

    if (!deletedTask) {
      return res.status(404).json({message: "Task not found"});
    }

    res.json({message: "Task deleted successfully"});
  } catch (error) {
    res.status(500).json({message: "Error deleting task", error});
  }
};
