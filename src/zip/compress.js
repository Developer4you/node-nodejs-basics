import { createReadStream, createWriteStream } from 'fs';
import { createGzip } from 'zlib';
import { pipeline } from 'stream/promises';
import { join } from 'path';

const compress = async () => {
    const inputPath = join('src/zip/files', 'fileToCompress.txt');
    const outputPath = join('src/zip/files', 'archive.gz');

    const gzip = createGzip();
    const readable = createReadStream(inputPath);
    const writable = createWriteStream(outputPath);

    try {
        await pipeline(
            readable,
            gzip,
            writable
        );
        console.log('\n-Done-');
    } catch (error) {
        console.error('Compression failed:', error.message);
        process.exit(1);
    }
};

await compress();