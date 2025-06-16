import mongoose, { Schema, Document } from "mongoose";

interface IItem extends Document {
    name: string;
    price: number;
    itemImage: { cloudinaryUrl: string, cloudinaryPublicId: string };
}

const itemSchema: Schema = new Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    itemImage: { type: Object, required: true },
})

export const itemModel = mongoose.model<IItem>("Items", itemSchema);