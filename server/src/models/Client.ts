import mongoose, { Document, Schema } from 'mongoose';

export interface INote {
    content: string;
    author: string; // Name or ID
    createdAt: Date;
}

export interface IClient extends Document {
    name: string;
    companyName?: string;
    email: string;
    phone: string;
    status: 'active' | 'inactive' | 'prospect';
    notes: INote[];
    totalMatters: number;
}

const ClientSchema = new Schema<IClient>({
    name: { type: String, required: true },
    companyName: { type: String },
    email: { type: String, required: true },
    phone: { type: String },
    status: {
        type: String,
        enum: ['active', 'inactive', 'prospect'],
        default: 'prospect'
    },
    notes: [{
        content: { type: String, required: true },
        author: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
    }],
    totalMatters: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model<IClient>('Client', ClientSchema);
