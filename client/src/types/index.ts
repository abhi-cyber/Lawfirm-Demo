export interface IUser {
    _id: string;
    name: string;
    email: string;
    role: 'partner' | 'associate' | 'paralegal' | 'staff';
    avatarUrl?: string;
    specialties: string[];
}

export interface INote {
    content: string;
    author: string;
    createdAt: string;
}

export interface IClient {
    _id: string;
    name: string;
    companyName?: string;
    email: string;
    phone: string;
    status: 'active' | 'inactive' | 'prospect';
    notes: INote[];
    totalMatters: number;
}

export interface ICase {
    _id: string;
    title: string;
    caseNumber: string;
    client: IClient | string; // populated or id
    assignedTeam: IUser[] | string[];
    status: 'intake' | 'discovery' | 'trial' | 'closed';
    priority: 'high' | 'medium' | 'low';
    stage: string;
    deadline?: string;
}

export interface ITask {
    _id: string;
    title: string;
    description: string;
    status: 'pending' | 'in-progress' | 'completed';
    dueDate: string;
    assignedTo: IUser | string;
    relatedCase?: ICase | string;
    priority: 'high' | 'medium' | 'low';
}
