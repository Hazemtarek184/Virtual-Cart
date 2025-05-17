import { userModel } from "../models/user-model";
import bcrypt from "bcrypt";
import { IPhotoType } from "../types/commonTypes";
import { webToken } from "../utils/jwt-web-token";

require('dotenv').config()
const cloudinary = require('cloudinary').v2;
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface IRegisterFormat {
    username: string;
    email: string;
    password: string;
    fileData: IPhotoType;
}

export const register = async ({ username, email, password, fileData }: IRegisterFormat) => {
    try {
        const isUserRegistered = await userModel.findOne({ email });

        if (isUserRegistered)
            return { statusCode: 409, statusMessage: "User Already Exists", data: "" };

        const hashedPassword = await bcrypt.hash(password, 10);

        let cloudinaryUrl = '';
        let cloudinaryPublicId = '';

        if (fileData) {
            const dataUri = `data:${fileData.mimetype};base64,${fileData.buffer.toString('base64')}`;

            const result = await cloudinary.uploader.upload(dataUri);
            cloudinaryUrl = result.secure_url;
            cloudinaryPublicId = result.public_id;
        }

        const newUser = new userModel({
            username,
            email,
            password: hashedPassword,
            userPhoto: { cloudinaryPublicId, cloudinaryUrl }
        });

        await newUser.save();

        return { statusCode: 200, statusMessage: "User Added", data: cloudinaryUrl };
    }
    catch (err) {
        console.log(err);
        return { statusCode: 500, statusMessage: "Server error", data: "" };
    }
}

export const login = async ({ email, password }: { email: string, password: string }) => {
    try {
        const user = await userModel.findOne({ email });
        if (!user) return { statusCode: 404, statusMessage: "User Not Found", data: null };

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) return { statusCode: 401, statusMessage: "Invalid Password", data: null };

        const token = webToken(user.username + isPasswordValid);

        return { statusCode: 200, statusMessage: "Login Successful", user: user, data: token };
    }
    catch (err) {
        console.log(err);
        return { statusCode: 500, statusMessage: "Server error", data: null };
    }
}