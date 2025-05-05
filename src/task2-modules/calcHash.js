import path from 'path';
import { createReadStream } from 'fs';
import { createHash } from 'crypto';

export async function hashFile(filePath, currentDir) {
    const fullPath = path.resolve(currentDir, filePath);
    const hash = createHash('sha256');

    return new Promise((resolve, reject) => {
        const stream = createReadStream(fullPath);

        stream.on('error', (err) => {
            console.log('Operation failed');
            reject(err);
        });

        stream.on('data', chunk => hash.update(chunk));

        stream.on('end', () => {
            console.log(hash.digest('hex'));
            resolve();
        });
    });
}