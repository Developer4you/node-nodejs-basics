import os from 'os';
import path from 'path';
import readline from 'readline';
import process from 'process';
import fs from 'fs/promises';
import { pipeline } from 'stream/promises';
import { createReadStream, createWriteStream } from 'fs';
import { createHash } from 'crypto';
import { createBrotliCompress, createBrotliDecompress } from 'zlib';

const args = process.argv.slice(2);
const usernameArg = args.find(arg => arg.startsWith('--username='));
const username = usernameArg ? usernameArg.split('=')[1] : 'Anonymous';

const homeDir = os.homedir();
let currentDir = homeDir;

console.log(`Welcome to the File Manager, ${username}!`);
printCurrentDirectory();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '> ',
});

rl.on('SIGINT', () => {
    exitProgram();
});

rl.prompt();

rl.on('line', async (line) => {
    const input = line.trim();

    if (input === '.exit') {
        exitProgram();
        return;
    }

    try {
        await handleCommand(input);
    } catch {
        console.log('Operation failed');
    }

    printCurrentDirectory();
    rl.prompt();
});

async function handleCommand(input) {
    const [command, ...args] = input.split(' ');

    switch (command) {
        case 'up':
            moveUp();
            break;

        case 'cd':
            if (!args[0]) return console.log('Invalid input');
            await changeDirectory(args[0]);
            break;

        case 'ls':
            await listDirectoryContents();
            break;

        case 'cat':
            if (!args[0]) return console.log('Invalid input');
            await readFile(args[0]);
            break;

        case 'add':
            if (!args[0]) return console.log('Invalid input');
            await addFile(args[0]);
            break;

        case 'mkdir':
            if (!args[0]) return console.log('Invalid input');
            await makeDirectory(args[0]);
            break;

        case 'rn':
            if (args.length < 2) return console.log('Invalid input');
            await renameFile(args[0], args[1]);
            break;

        case 'cp':
            if (args.length < 2) return console.log('Invalid input');
            await copyFile(args[0], args[1]);
            break;

        case 'mv':
            if (args.length < 2) return console.log('Invalid input');
            await moveFile(args[0], args[1]);
            break;

        case 'rm':
            if (!args[0]) return console.log('Invalid input');
            await removeFile(args[0]);
            break;

        case 'os':
            await handleOSCommand(args[0]);
            break;

        case 'hash':
            if (!args[0]) return console.log('Invalid input');
            await hashFile(args[0]);
            break;

        case 'compress':
            if (args.length < 2) return console.log('Invalid input');
            await compressFile(args[0], args[1]);
            break;

        case 'decompress':
            if (args.length < 2) return console.log('Invalid input');
            await decompressFile(args[0], args[1]);
            break;

        default:
            console.log('Invalid input');
    }
}

async function changeDirectory(dir) {
    const targetPath = path.resolve(currentDir, dir);
    try {
        const stats = await fs.stat(targetPath);
        if (!stats.isDirectory()) throw new Error();

        const root = path.parse(currentDir).root;
        if (!targetPath.startsWith(root)) throw new Error();

        currentDir = targetPath;
    } catch {
        throw new Error('Operation failed');
    }
}

function moveUp() {
    const parentDir = path.dirname(currentDir);
    const root = path.parse(currentDir).root;

    if (currentDir !== root) {
        currentDir = parentDir;
    }
}

function printCurrentDirectory() {
    console.log(`You are currently in ${currentDir}`);
}

function exitProgram() {
    process.stdout.write(`Thank you for using File Manager, ${username}, goodbye!\n`);
    rl.close();
    process.nextTick(() => process.exit(0));
}

async function listDirectoryContents() {
    try {
        const items = await fs.readdir(currentDir, { withFileTypes: true });

        const folders = [];
        const files = [];

        for (const item of items) {
            if (item.isDirectory()) {
                folders.push({ Name: item.name, Type: 'directory' });
            } else {
                files.push({ Name: item.name, Type: 'file' });
            }
        }

        folders.sort((a, b) => a.Name.localeCompare(b.Name));
        files.sort((a, b) => a.Name.localeCompare(b.Name));

        const result = [...folders, ...files];
        console.table(result);
    } catch {
        throw new Error('Operation failed');
    }
}

async function readFile(filePath) {
    const fullPath = path.resolve(currentDir, filePath);
    const stream = createReadStream(fullPath);
    stream.on('error', () => console.log('Operation failed'));
    stream.pipe(process.stdout);
    stream.on('end', () => {
        console.log();
        printCurrentDirectory();
        rl.prompt();
    });
}

async function addFile(name) {
    // добавить проверку от уже созданного файла
    const filePath = path.join(currentDir, name);
    await fs.writeFile(filePath, '');
}

async function makeDirectory(name) {
    // добавить проверку от уже созданной папки
    const dirPath = path.join(currentDir, name);
    await fs.mkdir(dirPath);
}

async function renameFile(oldPath, newName) {
    const oldFullPath = path.resolve(currentDir, oldPath);
    const newFullPath = path.join(path.dirname(oldFullPath), newName);
    await fs.rename(oldFullPath, newFullPath);
}

async function copyFile(src, destDir) {
    const srcPath = path.resolve(currentDir, src);
    const destPath = path.join(path.resolve(currentDir, destDir), path.basename(src));

    await pipeline(
        createReadStream(srcPath),
        createWriteStream(destPath)
    );
}

async function moveFile(src, destDir) {
    await copyFile(src, destDir);
    const srcPath = path.resolve(currentDir, src);
    await fs.unlink(srcPath);
}

async function removeFile(filePath) {
    const fullPath = path.resolve(currentDir, filePath);
    await fs.unlink(fullPath);
}

async function handleOSCommand(flag) {
    switch (flag) {
        case '--EOL':
            console.log(JSON.stringify(os.EOL));
            break;
        case '--cpus':
            const cpus = os.cpus();
            console.log(`Total CPUs: ${cpus.length}`);
            cpus.forEach((cpu, index) => {
                console.log(`CPU ${index + 1}: ${cpu.model}, ${cpu.speed / 1000} GHz`);
            });
            break;
        case '--homedir':
            console.log(os.homedir());
            break;
        case '--username':
            console.log(os.userInfo().username);
            break;
        case '--architecture':
            console.log(process.arch);
            break;
        default:
            console.log('Invalid input');
    }
}

async function hashFile(filePath) {
    const fullPath = path.resolve(currentDir, filePath);
    const hash = createHash('sha256');
    const stream = createReadStream(fullPath);

    stream.on('error', () => console.log('Operation failed'));

    stream.on('data', chunk => hash.update(chunk));
    stream.on('end', () => {
        console.log(hash.digest('hex'));
    });
}

async function compressFile(src, dest) {
    const srcPath = path.resolve(currentDir, src);
    const destPath = path.resolve(currentDir, dest);

    await pipeline(
        createReadStream(srcPath),
        createBrotliCompress(),
        createWriteStream(destPath)
    );
}

async function decompressFile(src, dest) {
    const srcPath = path.resolve(currentDir, src);
    const destPath = path.resolve(currentDir, dest);

    await pipeline(
        createReadStream(srcPath),
        createBrotliDecompress(),
        createWriteStream(destPath)
    );
}
