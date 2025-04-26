import { rename as rnm, access } from 'fs/promises';
import { constants } from 'fs';
import { join } from 'path';

const rename = async () => {

    const path = join('src/fs/files', 'wrongFilename.txt');
    const newPath = join('src/fs/files_copy', 'properFilename.md');

    try {
        await access(path, constants.F_OK);

        try {
            await access(newPath, constants.F_OK);
            throw new Error('FS operation failed');
        } catch (err) {
            if (err.code !== 'ENOENT') {
                throw new Error('FS operation failed');
            }
        }

        await rnm(path, newPath);
        console.log('File renamed successfully!');
    } catch (err) {
        throw new Error('FS operation failed');
    }

};

await rename();