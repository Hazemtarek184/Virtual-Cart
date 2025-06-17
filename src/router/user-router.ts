import express from "express";
import { upload } from "../middlewares/multer-cdn-upload";
import { login, register } from "../service/user-service";
import { emitNewItem, emitUserPhoto } from "../socket";
import sharp from "sharp";

const router = express.Router();

router.post('/register', async (req, res) => {
    try {
        const { username, email, password, image, mimeType } = req.body;

        if (!username || !email || !password) {
            res.status(400).send("User Data is Required").end();
            return;
        }
        if (!image || !mimeType) {
            res.status(400).json({ statusMessage: "Image data is required" });
            return;
        }

        const imageBuffer = Buffer.from(image, 'base64');
        const fileData = {
            buffer: imageBuffer,
            mimetype: mimeType
        }

        const { statusCode, statusMessage, data } = await register({ username, email, password, fileData });

        // emitUserPhoto(fileData);

        res.status(statusCode).send({ statusMessage });
    }
    catch (err) {
        console.error("Error :", err);
        res.status(500).send({ err });
    }
})

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        console.log("Request Body:", req.body);

        if (!email || !password) {
            console.log(email, password);
            res.status(400).send("User Data is Required").end();
            return;
        }

        const { statusCode, statusMessage, user, data } = await login({ email, password });


        if (!user) {
            res.status(statusCode).send(statusMessage);
            return;
        }

        emitUserPhoto({
            userPhoto: {
                buffer: Buffer.from(user.userPhoto.cloudinaryUrl, 'base64'),
                mimetype: 'image/jpeg'
            },
            token: data
        });

        console.log(data);

        res.status(statusCode).json({ statusMessage, token: data });
    }
    catch (err) {
        console.error("Error :", err);
        res.status(500).send({ err });
    }
})

router.post('/uploadPhotos', async (req, res) => {
    try {
        const { token, userPhotos } = req.body;

        console.log("Request Body:", req.body);

        if (!token || !userPhotos || !Array.isArray(userPhotos) || userPhotos.length === 0) {
            res.status(400).send("Token and at least one photo are required");
            return;
        }

        for (let i = 0; i < userPhotos.length; i++) {
            const photo = userPhotos[i];
            if (!photo.image || !photo.mimeType) {
                res.status(400).send(`Photo at index ${i} is missing image or mimeType`);
                return;
            }
        }

        console.log(`Received ${userPhotos.length} photos`);

        userPhotos.forEach((photo, index) => {
            emitUserPhoto({
                userPhoto: photo,
                token: token
            });
        });

        res.status(200).send("Users Photos Emitted");
    }
    catch (err) {
        console.error("Error :", err);
        res.status(500).send({ err });
    }
});

// router.post('/', upload.single('userPhoto'), async (req, res) => {
//     if (!req.file) {
//         res.status(400).send("User Photo is Required").end();
//         return;
//     }

//     const fileData = {
//         buffer: req.file.buffer,
//         mimetype: req.file.mimetype
//     }

//     const dataUri = `data:${fileData.mimetype};base64,${fileData.buffer.toString('base64')}`;

//     emitUserPhoto(dataUri);

//     res.send(dataUri).end();
// })

router.get('/', async (req, res) => {
    try {
        const item = {
            itemName: "water",
            token: "eyJhbGciOiJIUzI1NiJ9.cGV0ZXJ0cnVl.gWy6jTn6nW-rkaR6nK-hHafwO3wK7ocJ18KS99hsxD8",
            state: "caught"
        };

        emitNewItem(item);

        console.log(item);

        res.status(200).send("Socket Emit Test");
    }
    catch (err) {
        console.error("Error :", err);
        res.status(500).send({ err });
    }
}
);

router.post('/', upload.single('userPhoto'), async (req, res) => {
    if (!req.file) {
        res.status(400).send("User Photo is Required").end();
        return;
    }

    try {
        const fileData = {
            buffer: req.file.buffer,
            mimetype: req.file.mimetype
        }

        var dataUri = '';

        sharp(fileData.buffer)
            .rotate()
            .withMetadata()
            .resize(1280, 720, {
                fit: 'inside',
                withoutEnlargement: true
            })
            .toBuffer()
            .then((resizedBuffer) => {
                dataUri = `data:${fileData.mimetype};base64,${resizedBuffer.toString('base64')}`;

                // emitUserPhoto(dataUri);

                res.send(dataUri).end();
            })
            .catch(err => {
                console.error('Sharp processing error:', err);
                res.status(500).send("Error processing image").end();
            });

    } catch (error) {
        console.error('Error resizing image:', error);
        res.status(500).send("Error processing image").end();
    }
});

export default router;
