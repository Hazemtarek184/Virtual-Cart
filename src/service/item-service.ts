import { itemModel } from "../models/item-model";

const cloudinary = require('cloudinary').v2;
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface IItemFormat {
    name: string;
    price: number;
    fileData?: {
        buffer: Buffer;
        mimetype: string;
    } | null;
}

export const addItem = async ({ name, price, fileData }: IItemFormat) => {
    try {
        const isItemAdded = await itemModel.findOne({ name });

        if (isItemAdded)
            return { statusCode: 409, statusMessage: "Item Name Already Exists", data: "" };

        let cloudinaryUrl = '';
        let cloudinaryPublicId = '';

        if (fileData) {
            const dataUri = `data:${fileData.mimetype};base64,${fileData.buffer.toString('base64')}`;

            const result = await cloudinary.uploader.upload(dataUri);
            cloudinaryUrl = result.secure_url;
            cloudinaryPublicId = result.public_id;
        }

        const newItem = new itemModel({
            name,
            price,
            userPhoto: { cloudinaryPublicId, cloudinaryUrl }
        });

        await newItem.save();

        return { statusCode: 200, statusMessage: "Item Added", data: cloudinaryUrl };
    }
    catch (err) {
        console.log(err);
        return { statusCode: 500, statusMessage: "Server error", data: "" };
    }
}