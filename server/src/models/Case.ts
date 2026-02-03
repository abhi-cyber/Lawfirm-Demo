import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ICase extends Document {
    title: string;
    caseNumber: string;
    client: Types.ObjectId;
    assignedTeam: Types.ObjectId[];
    status: 'intake' | 'discovery' | 'trial' | 'closed';
    priority: 'high' | 'medium' | 'low';
    deadline?: Date;
    description: string;
    stage: string; // Kanban column: "To Do", "In Progress", "Review", "Done"
}

const CaseSchema = new Schema<ICase>({
    title: { type: String, required: true },
    caseNumber: { type: String, required: true, unique: true },
    client: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
    assignedTeam: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    status: {
        type: String,
        enum: ['intake', 'discovery', 'trial', 'closed'],
        default: 'intake'
    },
    priority: {
        type: String,
        enum: ['high', 'medium', 'low'],
        default: 'medium'
    },
    deadline: { type: Date },
    description: { type: String },
    stage: {
        type: String,
        default: 'To Do'
    }
}, { timestamps: true });

export default mongoose.model<ICase>('Case', CaseSchema);
