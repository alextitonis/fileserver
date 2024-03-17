import express, { json } from "express";
import multer from "multer";
import path from "path";
import * as fs from "fs";
import dotenv from "dotenv";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";

if (!fs.existsSync("uploads/")) {
  fs.mkdirSync("uploads/");
}
dotenv.config();
const app = express();
app.use(cors());
app.use(json({ limit: "50mb" }));
const PORT = process.env.PORT || 3000;

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Rename files with current timestamp
  },
});
const upload = multer({ storage: storage });

// Serve static files from the 'uploads' directory
app.use("/uploads", express.static("uploads"));

// Render HTML form for file upload
app.get("/", (req, res) => {
  res.send(`
    <form action="/upload" method="post" enctype="multipart/form-data">
      <input type="file" name="image" accept="image/*">
      <button type="submit">Upload Image</button>
    </form>
  `);
});

// Handle file upload
app.post("/upload", (req, res) => {
    console.log(req.body);
  const { img } = req.body;
  const uuid = uuidv4();
  const filename = `uploads/${uuid}.png`;
  const base64Data = img.replace(/^data:image\/png;base64,/, "");
  fs.writeFileSync(filename, base64Data, "base64");
  const imageUrl = `https://${req.get("host")}/${filename}`;
  res.send({ imageUrl });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
