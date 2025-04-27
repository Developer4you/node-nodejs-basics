import { createHash } from 'crypto';
import { createReadStream } from 'fs';
import path from 'path';

const calculateHash = async () => {

    const filePath = path.join('src/hash/files', 'fileToCalculateHashFor.txt');
    const fileStream = createReadStream(filePath);
    const hash = createHash('sha256');
    fileStream.pipe(hash);
    hash.on('finish', () => {
        const result = hash.digest('hex');
        console.log(`SHA256 Hash: ${result}`);
    });

};

await calculateHash();