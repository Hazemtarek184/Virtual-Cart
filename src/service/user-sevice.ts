import { Server, Socket } from "socket.io";
import { userModel } from "../model/user-model";
import bcrypt from "bcrypt";

const cloudinary = require('cloudinary').v2;
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const socketIo = new Server(5050);

socketIo.on("connection", (socket: Socket) => {
    console.log(socket.id);

    socket.on("message", (data) => {
        console.log("Received message:", data);
        socketIo.emit("message", data);
    });
})

interface IRegisterFormat {
    username: string;
    email: string;
    password: string;
    fileData?: {
        buffer: Buffer;
        mimetype: string;
    } | null;
}

export const register = async ({ username, email, password, fileData }: IRegisterFormat) => {
    try {
        const isUserRegistered = await userModel.findOne({ username });

        if (isUserRegistered)
            return { statusCode: 409, statusMessage: "User Already Exists" };

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

        return { statusCode: 200, statusMessage: "User Added" };
    }
    catch (err) {
        console.log(err);
        return { statusCode: 500, statusMessage: "Server error" };
    }
}