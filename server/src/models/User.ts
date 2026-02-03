import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
    name: string;
    email: string;
    password?: string; // Optional for demo if using mock auth
    role: 'partner' | 'associate' | 'paralegal' | 'staff';
    avatarUrl?: string;
    specialties: string[];
}

const UserSchema = new Schema<IUser>({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    role: {
        type: String,
        enum: ['partner', 'associate', 'paralegal', 'staff'],
        default: 'associate'
    },
    avatarUrl: { type: String },
    specialties: [{ type: String }]
}, { timestamps: true });

export default mongoose.model<IUser>('User', UserSchema);
