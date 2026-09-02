import { Storage } from '@google-cloud/storage';
const BUCKET_NAME = process.env.BUCKET_NAME || '';
const storage = new Storage();
const bucket = BUCKET_NAME ? storage.bucket(BUCKET_NAME) : null;
