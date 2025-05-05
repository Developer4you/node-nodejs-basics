import path from 'path';
import { pipeline } from 'stream/promises';
import { createReadStream, createWriteStream } from 'fs';
import { createBrotliCompress } from 'zlib';

export async function compressFile(src, dest, currentDir) {
    const srcPath = path.resolve(currentDir, src);
    const destPath = path.resolve(currentDir, dest);

    await pipeline(
        createReadStream(srcPath),
        createBrotliCompress(),
        createWriteStream(destPath)
    );
}