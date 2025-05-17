import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
require('dotenv').config()

import { Server, Socket } from "socket.io";
const SOCKET_PORT = process.env.SOCKET_PORT;
if (!SOCKET_PORT) {
    console.error("Missing SOCKET_PORT environment variable");
    process.exit(1);
}

export const socketIo = new Server(Number(SOCKET_PORT));
import userRouter from "./router/user-router";
import mongoose from "mongoose";
import itemRouter from "./router/item-router";

const app = express();
const PORT = process.env.PORT;
const MONGOURI = process.env.MONGO_CONNECTION_URI;
export const SECRET_KEY = process.env.JWT_SECRET;

app.use((req: Request, res: Response, next: NextFunction): void => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
        return;
    }

    next();
});
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/api/user', userRouter);
app.use('/item', itemRouter);


// app.use((req, res, next) => {
//     console.log('Request Headers:', req.headers);
//     console.log('Content-Type:', req.headers['content-type']);
//     next();
// });

if (!MONGOURI) {
    console.error("Missing MONGO_CONNECTION_URI environment variable");
    process.exit(1);
}

mongoose.connect(MONGOURI)
    .then(() => {
        console.log("Connected to the database.");
    }).catch((err) => {
        console.error("Database connection error:", err);
        process.exit(1);
    });

app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`listening to port : ${PORT}`)
});

