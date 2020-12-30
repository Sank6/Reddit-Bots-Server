import * as mongoose from 'mongoose';
import { Document } from 'mongoose';

export interface IBot extends Document {
    username: string;
    dateAdded: Date;
    score: number;
}

const ServerSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    dateAdded: {
        type: Date,
        default: Date.now(),
        required: true
    },
    score: {
        type: Number,
        default: 0,
        required: true
    }
});

export default mongoose.model<IBot>("Bot", ServerSchema);