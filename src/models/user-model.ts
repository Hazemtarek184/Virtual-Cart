import mongoose, { Schema, Document } from "mongoose";

interface IUser extends Document {
    username: string;
    password: string;
    email: string;
    userPhoto: { cloudinaryUrl: string, cloudinaryPublicId: string };
}

const userSchema: Schema = new Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    userPhoto: { type: Object, required: true },
})

export const userModel = mongoose.model<IUser>("Users", userSchema);