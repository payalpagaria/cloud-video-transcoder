# 🎬 Cloud Video Transcoder

A cloud-based **video transcoding and upload service** built using **Node.js**, **Express**, **Busboy**, **FFmpeg**, and **Google Cloud Storage (GCS)**.  
This app allows users to upload videos, automatically transcodes them into multiple resolutions (240p, 360p, 480p, 720p), and stores the results in GCP buckets — ready to stream or download.

---

## 🚀 Features

✅ Upload large video files using **streaming (Busboy)**  
✅ **Automatic transcoding** with FFmpeg into multiple resolutions  
✅ Store and retrieve videos from **Google Cloud Storage (GCS)**  
✅ **RESTful APIs** for upload and listing videos  
✅ Dockerized setup for easy deployment  
✅ Designed for **scalability** and **extensibility** (worker pattern)  
✅ Built with clean folder structure and environment isolation  

---

## 🧱 Tech Stack

| Layer | Technology |
|-------|-------------|
| Backend | Node.js, Express |
| Video Processing | FFmpeg (via `fluent-ffmpeg`) |
| File Upload | Busboy streams |
| Cloud Storage | Google Cloud Storage (GCS) |
| Containerization | Docker |

---

## 📁 Folder Structure

```
video-transcoder-backend/
 ├── src/
 │   ├── controllers/         
 │   ├── models/              
 │   ├── routes/
 │   │   ├── uploadRoute.js   # Handles uploads & triggers transcoding
 │   │    
 │   ├── workers/
 │   │   └── transcoderWorker.js  # FFmpeg logic + GCS integration
 │   └── server.js            # Entry point (Express app)
 ├── .env                     # Environment variables (ignored)
 ├── Dockerfile               # For containerization
 ├── .dockerignore            # Exclude unnecessary files from Docker
 ├── .gitignore               # Exclude sensitive files from git
 ├── package.json
 └── README.md
```

---

## ⚙️ Environment Variables (.env)

Create a `.env` file in the project root:

```
PORT=8080
GOOGLE_APPLICATION_CREDENTIALS=./gcp-key.json
```

---

## ☁️ Google Cloud Setup

1. **Create two GCS buckets**
   - Input: `your_input_bucket_name_gcp`
   - Output: `your_output_bucket_name_gcp`

2. **Create a Service Account**
   ```bash
   gcloud iam service-accounts create transcoder-sa --display-name="Video Transcoder SA"
   ```

3. **Grant Permissions**
   ```bash
   gcloud projects add-iam-policy-binding <PROJECT_ID> --member="serviceAccount:transcoder-sa@<PROJECT_ID>.iam.gserviceaccount.com" --role="roles/storage.admin"
   ```

4. **Download Key**
   ```bash
   gcloud iam service-accounts keys create gcp-key.json --iam-account=transcoder-sa@<PROJECT_ID>.iam.gserviceaccount.com
   ```

5. **Store the key securely** in project root (ignored via `.gitignore`).

---

## 🐳 Docker Setup

### 🧩 Build the Docker Image
```bash
docker build -t video-transcoder .
```

### ▶️ Run the Container (with GCP Key + .env)
```bash
docker run -p 8080:8080 -v $(pwd)/gcp-key.json:/app/gcp-key.json   --env-file .env   video-transcoder
```

> This mounts your **Google Cloud credentials file** inside the container and loads environment variables safely.

---

## 🧠 API Endpoints

| Method | Endpoint | Description |
|--------|-----------|-------------|
| `POST` | `/upload` | Upload a video (streamed upload + auto transcode) |
| `GET`  | `/video`  | List transcoded videos with URLs.                 |


### Example Upload (Postman)
- URL: `http://localhost:8080/upload`
- Method: `POST`
- Body: `form-data`
  - Key: `file`
  - Type: File
  - Value: *(select your video)*

Response:
```json
{
  "message": "Upload complete. Transcoding started.",
  "files": ["uploads/1759598530754-clip.mp4"]
}
```

---

## 🧩 Worker Logic

The **transcoderWorker.js** file:
- Downloads uploaded video from **input bucket**
- Uses **FFmpeg** to generate multiple resolutions:
  - 240p, 360p, 480p, 720p
- Uploads each variant to **output bucket**
- Cleans up temporary files after processing

### Why FFmpeg?
FFmpeg allows real-time video processing with multiple codecs and compression levels.  
This approach ensures your videos are accessible across devices while minimizing storage cost.

---

## 🧩 System Architecture

```text
Frontend (optional)
       │
       ▼
   Express API
  /upload route
       │
       ▼
  Google Cloud Storage
 (input bucket)
       │
       ▼
  Worker (FFmpeg)
       │
       ▼
  Google Cloud Storage
 (output bucket)
```

---

## 🏁 Run Locally (without Docker)

```bash
npm install
npm run dev   # if using nodemon
# or
npm start
```

Visit → `http://localhost:8080`

---

💻 UI for Video Transcoder

A dedicated React + Vite frontend has been developed for this backend.
You can explore it here:
👉 Video Transcoder UI – https://github.com/payalpagaria/cloud-transcoder-ui


## 📜 License

This project is open-source under the **MIT License**.
