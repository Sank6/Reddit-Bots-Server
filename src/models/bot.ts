import * as mongoose from 'mongoose';
import { Document } from 'mongoose';

export interface IBot extends Document {
    username: string;
    description: string;
    avatar: string;
    cakeDay: Date;
    karma: Number,
    dateAdded: Date;
    lastUpdated: Date;
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
    karma: {
        type: Number,
        required: true
    },
    dateAdded: {
        type: Date,
        default: Date.now(),
        required: true
    },
    lastUpdated: {
        type: Date,
        default: Date.now(),
        required: true
    }
});

export default mongoose.model<IBot>("Bot", BotSchema);