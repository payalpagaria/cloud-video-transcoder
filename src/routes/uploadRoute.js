import express from 'express'
import Busboy from 'busboy';
import { Storage } from '@google-cloud/storage';
import { videoEncoder } from '../workers/transcoderWorker.js';
const router=express.Router()

const storage = new Storage({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});
const bucket = storage.bucket('your_input_bucket_name_gcp');
router.post('/',(req,res)=>{
       const busboy=Busboy({headers:req.headers})
        let uploadPromises=[]

      busboy.on('file', (fieldname, file, info) => {
  const { filename: originalName, mimeType } = info; 
  const safeBase = String(originalName || 'video').replace(/[/\\?%*:|"<>]/g, '_');
  const stampedName = `${Date.now()}-${safeBase}`;       
  const objectPath  = `uploads/${stampedName}`;
  const gcsFile     = bucket.file(objectPath);

  const stream = gcsFile.createWriteStream({
    resumable: false,
    contentType: mimeType || 'application/octet-stream',
    metadata: { fieldname },
  });

  uploadPromises.push(new Promise((resolve, reject) => {
    file.pipe(stream)
      .on('finish', () => resolve(objectPath)) 
      .on('error', reject);
  }));
});

busboy.on('finish', async () => {
  const objectPaths = await Promise.all(uploadPromises); 
  const filenames = objectPaths.map(p => p.split('/').pop()); 

  filenames.forEach((filename) => {
    console.log('🎬 Starting transcoding for', filename, 'typeof=', typeof filename);
    videoEncoder(filename)            
      .then((urls) => console.log(' Transcoded:', urls))
      .catch((err) => console.error(` Error transcoding ${filename}:`, err));
  });

  res.json({ message: 'Upload complete. Transcoding started.', files: objectPaths });
});

           busboy.on('error', (err) => {
    res.status(500).json({ message: 'Upload failed', error: err.message });
  });
       req.pipe(busboy)
})

export default router;