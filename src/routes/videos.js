import express from "express";
import { Storage } from "@google-cloud/storage";
import path from "path"
const router = express.Router();
const storage = new Storage({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});
const bucket = storage.bucket("output_bucket_name_gcp"); // output bucket name

router.get("/", async (req, res) => {
  try {
    const [files] = await bucket.getFiles({ prefix: "transcoded/" });

    const fileList = files.map((file) => ({
      id: file.name,
      name: file.name.split("/").pop(),
      url: `https://storage.googleapis.com/${bucket.name}/${file.name}`,
      updated: file.metadata.updated,
      size: file.metadata.size,
      contentType: file.metadata.contentType,
    }));

    res.json({ files: fileList });
  } catch (error) {
    console.error("❌ Error listing videos:", error);
    res.status(500).json({ message: "Failed to list videos" });
  }
});

export default router;
