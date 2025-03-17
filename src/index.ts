import express from "express";
import userRouter from "./router/user-router";
import mongoose from "mongoose";

require('dotenv').config()
const app = express();
const PORT = process.env.PORT;
const MONGOURI = process.env.MONGO_CONNECTION_URI;

app.use(express.json());
app.use('/user', userRouter);

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

app.listen(PORT, () => {
    console.log(`listening to port : ${PORT}`)
});