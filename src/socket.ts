import { Socket } from "socket.io";
import { socketIo as io } from ".";
import { IEmitNewItem, IEmitUserPhoto, IPhotoType } from "./types/commonTypes";

io.on("connection", (socket: Socket) => {
    console.log("New client connected");

    socket.on("newItem", (item: IEmitNewItem) => {
        console.log("New item received", item);
        const { itemName, token, state } = item;
        emitNewItem({ itemName, token, state });
    });

    socket.on("disconnect", () => {
        console.log("Client disconnected");
    });
})


export const emitUserPhoto = ({ userPhoto, token }: IEmitUserPhoto) => {
    io.emit("userPhoto", { "token": token, "image_base64": userPhoto });
    console.log("User photo emitted : ", userPhoto);
};

export const emitNewItem = (item: IEmitNewItem) => {
    io.emit("newItem", item);
}