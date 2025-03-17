import mongoose, { Schema, Document } from "mongoose";

interface IUser extends Document {
    username: string;
    password: string;
    userPhoto: {cloudinaryUrl: string, cloudinaryPublicId:string };
}

const userSchema: Schema = new Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    userPhoto: { type: Object },
})

export const userModel = mongoose.model<IUser>("Users", userSchema);