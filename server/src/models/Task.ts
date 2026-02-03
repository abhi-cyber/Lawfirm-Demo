import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ITask extends Document {
    title: string;
    description: string;
    status: 'pending' | 'in-progress' | 'completed';
    dueDate: Date;
    assignedTo: Types.ObjectId;
    relatedCase?: Types.ObjectId;
    priority: 'high' | 'medium' | 'low';
}

const TaskSchema = new Schema<ITask>({
    title: { type: String, required: true },
    description: { type: String },
    status: {
        type: String,
        enum: ['pending', 'in-progress', 'completed'],
        default: 'pending'
    },
    dueDate: { type: Date },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    relatedCase: { type: Schema.Types.ObjectId, ref: 'Case' },
    priority: {
        type: String,
        enum: ['high', 'medium', 'low'],
        default: 'medium'
    }
}, { timestamps: true });

export default mongoose.model<ITask>('Task', TaskSchema);
