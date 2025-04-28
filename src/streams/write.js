import { createWriteStream } from 'fs';
import { join } from 'path';

const write = async () => {
    const path = join('src/streams/files', 'fileToWrite.txt');
    const writableStream = createWriteStream(path);

    writableStream.on('error', (err) => {
        console.error('FS operation failed:', err.message);
        process.exit(1);
    });

    console.log('Please enter the text. To finish, press Ctrl+Z (for Windows) or Ctrl+D (for Mac).')

    process.stdin.pipe(writableStream);

    writableStream.on('finish', () => {
        console.log('\nThe recording was completed successfully. Check the contents of the file fileToWrite.txt');
    });
};

await write();