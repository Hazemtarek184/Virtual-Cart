import express from "express";
import { upload } from "../middlewares/multer-cdn-upload";
import { addItem } from "../service/item-service";
import { itemModel } from "../models/item-model";

const router = express.Router();

router.post('/item', upload.single('itemImage'), async (req, res) => {
    try {
        if (!req.file) {
            res.status(400).send("Item Photo is Required").end();
            return;
        }

        const fileData = {
            buffer: req.file.buffer,
            mimetype: req.file.mimetype
        }

        const { itemName, itemPrice } = req.body;
        const { statusCode, statusMessage, data } = await addItem({ name: itemName, price: itemPrice, fileData });

        res.status(statusCode).send(data);
    }
    catch (err) {
        console.error("Error :", err);
        res.status(500).send({ err });
    }
})

router.get('/items', async (req, res) => {
    try {
        console.log("Fetching all items...");

        const items = await itemModel.find();

        if (!items) {
            res.status(404).send("No Items Found").end();
            return;
        }

        res.status(200).send(items);
    } catch (err) {
        console.error("Error :", err);
        res.status(500).send({ err });
    }
})

export default router;
