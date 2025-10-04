import ffmpeg from 'fluent-ffmpeg';
import { Storage } from '@google-cloud/storage';
import fs from 'fs';
import path from 'path';

const storage = new Storage({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS, 
});
const INPUT_BUCKET  = storage.bucket('your_input_bucket_name_gcp'); // input bucket name
const OUTPUT_BUCKET = storage.bucket('your_output_bucket_name_gcp'); // output bucket name

export async function videoEncoder(name) {
  if (typeof name !== 'string') {
    console.error('videoEncoder(): non-string passed:', name);
    throw new Error('videoEncoder expected a string filename');
  }

  const safeName = name.replace(/[/\\?%*:|"<>]/g, '_'); 
  const { name: base, ext } = path.parse(safeName);     

  const inputGcsPath = `uploads/${safeName}`;
  const inputLocal   = path.join('/tmp', safeName);

  try { fs.mkdirSync('/tmp', { recursive: true }); } catch {}

  console.log(' Downloading from GCS:', inputGcsPath);
  await INPUT_BUCKET.file(inputGcsPath).download({ destination: inputLocal });

  const variants = [
    { label: '240p', w: 426, h: 240 },
    { label: '360p', w: 640, h: 360 },
    { label: '480p', w: 854, h: 480 },
    { label: '720p', w: 1280, h: 720 },
  ];

  const results = [];

  for (const { label, w, h } of variants) {
    const outLocal   = path.join('/tmp', `${base}_${label}${ext || '.mp4'}`);     
    const outGcsPath = `transcoded/${base}_${label}${ext || '.mp4'}`;              
    console.log(`Transcoding → ${label}:`, outLocal);

    await new Promise((resolve, reject) => {
      ffmpeg(inputLocal)
        .videoCodec('libx264')
        .audioCodec('aac')
        .size(`${w}x${h}`)
        .outputOptions(['-preset fast', '-crf 26', '-b:a 128k'])
        .on('error', (e) => reject(e))
        .on('end', resolve)
        .save(outLocal); 
    });

    console.log('Uploading variant to GCS:', outGcsPath);
    await OUTPUT_BUCKET.upload(outLocal, {
      destination: outGcsPath,
      metadata: { contentType: 'video/mp4' },
    });

    results.push(`gs://${OUTPUT_BUCKET.name}/${outGcsPath}`);

    // cleanup this variant
    try { fs.unlinkSync(outLocal); } catch {}
  }

  // cleanup original download
  try { fs.unlinkSync(inputLocal); } catch {}

  return results;
}
