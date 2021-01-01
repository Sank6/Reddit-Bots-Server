import * as mongoose from 'mongoose';
import { Document } from 'mongoose';

export interface IBot extends Document {
    username: string;
    description: string;
    avatar: string;
    cakeDay: Date;
    dateAdded: Date;
    likes: number;
}

const BotSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        default: ""
    },
    avatar: {
        type: String,
        required: true,
    },
    cakeDay: {
        type: Date,
        required: true
    },
    dateAdded: {
        type: Date,
        default: Date.now(),
        required: true
    },
    likes: {
        type: Number,
        default: 0,
        required: true
    }
});

export default mongoose.model<IBot>("Bot", BotSchema);