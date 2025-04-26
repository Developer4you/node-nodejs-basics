import { readFile, access } from 'fs/promises';
import { constants } from 'fs';
import { join } from 'path';

const read = async () => {

    const path = join('src/fs/files', 'fileToRead.txt');

    try {
        await access(path, constants.F_OK);

        const content = await readFile(path, 'utf-8');
        console.log(content);
    } catch (err) {
        throw new Error('FS operation failed');
    }
};

await read();