import { createReadStream, createWriteStream } from 'fs';
import { createGunzip } from 'zlib';
import { pipeline } from 'stream/promises';
import { join } from 'path';

const decompress = async () => {
    const inputPath = join('src/zip/files', 'archive.gz');
    const outputPath = join('src/zip/files', 'fileToCompress.txt');

    const gunzip = createGunzip();
    const readable = createReadStream(inputPath);
    const writable = createWriteStream(outputPath);

    try {
        await pipeline(
            readable,
            gunzip,
            writable
        );
        console.log('\n--- Decompression done! ---');
    } catch (error) {
        console.error('Decompression failed:', error.message);
        process.exit(1);
    }
};

await decompress();