import path from 'path';
import { pipeline } from 'stream/promises';
import { createReadStream, createWriteStream } from 'fs';
import { createBrotliDecompress } from 'zlib';

export async function decompressFile(src, dest, currentDir) {
    const srcPath = path.resolve(currentDir, src);
    const destPath = path.resolve(currentDir, dest);

    await pipeline(
        createReadStream(srcPath),
        createBrotliDecompress(),
        createWriteStream(destPath)
    );
}