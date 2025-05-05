import path from 'path';
import process from 'process';
import fs from 'fs/promises';
import { pipeline } from 'stream/promises';
import { createReadStream, createWriteStream } from 'fs';

export async function readFile(filePath, currentDir) {
    const fullPath = path.resolve(currentDir, filePath);

    return new Promise((resolve, reject) => {
        const stream = createReadStream(fullPath);

        stream.on('error', (err) => {
            reject(err);
        });

        stream.pipe(process.stdout);

        stream.on('end', () => {
            console.log();
            resolve();
        });
    });
}

async function isExist(filePath) {
    try {
        await fs.access(filePath);
        return true;
    } catch (error) {
        if (error.code === 'ENOENT') {
            return false;
        }
    }
};

export async function addFile(name, currentDir) {
    const filePath = path.join(currentDir, name);
    if (await isExist(filePath)) {console.log('\x1b[31m%s\x1b[0m', 'Sorry. A file with that name already exists!')}
    else {
        await fs.writeFile(filePath, '');
    }
}

export async function makeDirectory(name, currentDir) {
    const dirPath = path.join(currentDir, name);
    if (await isExist(dirPath)) {console.log('\x1b[31m%s\x1b[0m', 'Sorry. A file with that name already exists!')}
    else {
        await fs.mkdir(dirPath)
    };
}

export async function renameFile(oldPath, newName, currentDir) {
    const oldFullPath = path.resolve(currentDir, oldPath);
    const newFullPath = path.join(path.dirname(oldFullPath), newName);
    await fs.rename(oldFullPath, newFullPath);
}

export async function copyFile(src, destDir, currentDir) {
    const srcPath = path.resolve(currentDir, src);
    const destPath = path.join(path.resolve(currentDir, destDir), path.basename(src));

    await pipeline(
        createReadStream(srcPath),
        createWriteStream(destPath)
    );
}

export async function moveFile(src, destDir, currentDir) {
    await copyFile(src, destDir, currentDir);
    const srcPath = path.resolve(currentDir, src);
    await fs.unlink(srcPath);
}

export async function removeFile(filePath, currentDir) {
    const fullPath = path.resolve(currentDir, filePath);
    await fs.unlink(fullPath);
}