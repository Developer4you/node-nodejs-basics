import { readdir, access } from 'fs/promises';
import { constants } from 'fs';
import { join } from 'path';

const list = async () => {

    const path = join('src', 'fs', 'files');

    try {
        await access(path, constants.F_OK);
        const files = await readdir(path);
        files.forEach(e=>console.log(e));
    } catch (err) {
        throw new Error('FS operation failed');
    }
};

await list();