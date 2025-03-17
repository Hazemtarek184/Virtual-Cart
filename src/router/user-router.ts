import express from "express"
import { upload } from "../middlewares/multer-cdn-upload";
import { register } from "../service/user-sevice"

const router = express.Router();

router.post('/userAccount', upload.single('userProfileImage'), async (req, res) => {
    try {
        if (!req.file) {
            res.status(400).send("User Photo is Required").end();
            return;
        }

        const fileData = {
            buffer: req.file.buffer,
            mimetype: req.file.mimetype
        }

        const { username, email, password } = req.body;
        const { statusCode, statusMessage } = await register({ username, email, password, fileData });
    }
    catch (err) {
        console.error("Error :", err);
        res.status(500).send({ err });
    }
})


export default router;