import { access, mkdir, readdir, copyFile} from 'fs/promises';
import { constants } from 'fs';
import { join } from 'path';

const copy = async () => {

    const path = join('src/fs/files');
    const pathForCopy = join('src/fs/files_copy');

    try {
        await access(path, constants.F_OK);
    } catch {
        throw new Error('FS operation failed');
        }

    try {
        await access(pathForCopy, constants.F_OK);
        throw new Error('FS operation failed');
    } catch (err) {
        if (err.code !== 'ENOENT') {
            throw new Error('FS operation failed');
        }
    }

    const copyRecursive = async (from, to) => {
        await mkdir(to, { recursive: true });
        const entries = await readdir(from, { withFileTypes: true });

        for (const entry of entries) {
            const path = join(from, entry.name);
            const pathForCopy = join(to, entry.name);

            if (entry.isDirectory()) {
                await copyRecursive(path, pathForCopy);
            } else {
                await copyFile(path, pathForCopy);
            }
        }
    };

    try {
        await copyRecursive(path, pathForCopy);
        console.log('Folder copied successfully!');
    } catch {
        throw new Error('FS operation failed');
    }

};

await copy();
