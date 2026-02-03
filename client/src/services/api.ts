import axios from "axios";
import {
  type IClient,
  type ICase,
  type ITask,
  type INote,
  type IUser,
} from "@/types";

// Use environment variable with fallback
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api";

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Client APIs
export const getClients = async (): Promise<IClient[]> => {
  const {data} = await api.get("/clients");
  return data;
};

export const getClientById = async (id: string): Promise<IClient> => {
  const {data} = await api.get(`/clients/${id}`);
  return data;
};

export type CreateClientInput = Omit<IClient, "_id" | "notes" | "totalMatters">;

export const createClient = async (
  client: CreateClientInput,
): Promise<IClient> => {
  const {data} = await api.post("/clients", client);
  return data;
};

export const updateClient = async (
  id: string,
  client: Partial<CreateClientInput>,
): Promise<IClient> => {
  const {data} = await api.put(`/clients/${id}`, client);
  return data;
};

export const deleteClient = async (id: string): Promise<void> => {
  await api.delete(`/clients/${id}`);
};

export const addClientNote = async (
  clientId: string,
  note: Omit<INote, "createdAt">,
): Promise<IClient> => {
  const {data} = await api.post(`/clients/${clientId}/notes`, note);
  return data;
};

// Case APIs
export const getCases = async (): Promise<ICase[]> => {
  const {data} = await api.get("/cases");
  return data;
};

export const getCaseById = async (id: string): Promise<ICase> => {
  const {data} = await api.get(`/cases/${id}`);
  return data;
};

export const getCasesByClient = async (clientId: string): Promise<ICase[]> => {
  const {data} = await api.get(`/cases?client=${clientId}`);
  return data;
};

export type CreateCaseInput = {
  title: string;
  caseNumber: string;
  client: string;
  assignedTeam: string[];
  status: ICase["status"];
  priority: ICase["priority"];
  stage: string;
  deadline?: string;
  description?: string;
};

export const createCase = async (caseData: CreateCaseInput): Promise<ICase> => {
  const {data} = await api.post("/cases", caseData);
  return data;
};

export const updateCase = async (
  id: string,
  caseData: Partial<CreateCaseInput>,
): Promise<ICase> => {
  const {data} = await api.put(`/cases/${id}`, caseData);
  return data;
};

export const updateCaseStatus = async (
  id: string,
  status: ICase["status"],
): Promise<ICase> => {
  const {data} = await api.patch(`/cases/${id}/status`, {status});
  return data;
};

export const updateCaseStage = async (
  id: string,
  stage: string,
): Promise<ICase> => {
  const {data} = await api.patch(`/cases/${id}/stage`, {stage});
  return data;
};

export const deleteCase = async (id: string): Promise<void> => {
  await api.delete(`/cases/${id}`);
};

// Task APIs
export const getTasks = async (): Promise<ITask[]> => {
  const {data} = await api.get("/tasks");
  return data;
};

export const getTaskById = async (id: string): Promise<ITask> => {
  const {data} = await api.get(`/tasks/${id}`);
  return data;
};

export const getTasksByCase = async (caseId: string): Promise<ITask[]> => {
  const {data} = await api.get(`/tasks?relatedCase=${caseId}`);
  return data;
};

export type CreateTaskInput = {
  title: string;
  description: string;
  status: ITask["status"];
  priority: ITask["priority"];
  dueDate: string;
  assignedTo: string;
  relatedCase?: string;
};

export const createTask = async (taskData: CreateTaskInput): Promise<ITask> => {
  const {data} = await api.post("/tasks", taskData);
  return data;
};

export const updateTask = async (
  id: string,
  taskData: Partial<CreateTaskInput>,
): Promise<ITask> => {
  const {data} = await api.put(`/tasks/${id}`, taskData);
  return data;
};

export const updateTaskStatus = async (
  id: string,
  status: ITask["status"],
): Promise<ITask> => {
  const {data} = await api.put(`/tasks/${id}`, {status});
  return data;
};

export const deleteTask = async (id: string): Promise<void> => {
  await api.delete(`/tasks/${id}`);
};

// User APIs
export const getUsers = async (): Promise<IUser[]> => {
  const {data} = await api.get("/users");
  return data;
};

export const getUserById = async (id: string): Promise<IUser> => {
  const {data} = await api.get(`/users/${id}`);
  return data;
};

export type CreateUserInput = {
  name: string;
  email: string;
  role: IUser["role"];
  specialties: string[];
  avatarUrl?: string;
};

export const createUser = async (userData: CreateUserInput): Promise<IUser> => {
  const {data} = await api.post("/users", userData);
  return data;
};

export const updateUser = async (
  id: string,
  userData: Partial<CreateUserInput>,
): Promise<IUser> => {
  const {data} = await api.put(`/users/${id}`, userData);
  return data;
};

export const deleteUser = async (id: string): Promise<void> => {
  await api.delete(`/users/${id}`);
};
