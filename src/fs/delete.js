import { unlink, access } from 'fs/promises';
import { constants } from 'fs';
import { join } from 'path';

const remove = async () => {

    const path = join('src/fs/files', 'fileToRemove.txt');

    try {
        await access(path, constants.F_OK);
        await unlink(path);
        console.log('File deleted successfully!');
    } catch (err) {
        throw new Error('FS operation failed');
    }

};

await remove();