import fs from 'fs';
import path from 'path';

export const logDir = path.join(process.cwd(), 'logs');
export const cacheDir = path.join(process.cwd(), '.cache');
export const emotesDir = path.join(cacheDir, 'emotes');

fs.mkdirSync(cacheDir, { recursive: true });
fs.mkdirSync(emotesDir, { recursive: true });
