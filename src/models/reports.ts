import * as mongoose from 'mongoose';
import { Document } from 'mongoose';

export interface IReport extends Document {
    username: string;
    reason: string;
    userReported: string;
    dateReported: Date;
}

const ReportSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    reason: {
        type: String,
        required: true
    },
    userReported: {
        type: String,
        required: true,
    },
    dateReported: {
        type: Date,
        default: Date.now(),
        required: true
    }
});

export default mongoose.model<IReport>("Report", ReportSchema);