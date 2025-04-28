import { createReadStream } from 'fs';
import { join } from 'path';

const read = async () => {
    const path = join('src', 'streams', 'files', 'file1ToRead.txt');

    const readableStream = createReadStream(path);
    readableStream.pipe(process.stdout);
    readableStream.on('error', (err) => {
        throw new Error('FS operation failed');
    });
    readableStream.on('end', () => {
        console.log('\n');
    });
};

await read();