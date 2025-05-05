import os from 'os';
import path from 'path';
import readline from 'readline';
import process from 'process';
import fs from 'fs/promises';

import { decompressFile } from "./task2-modules/decompress.js";
import { compressFile } from "./task2-modules/compress.js";
import { hashFile } from "./task2-modules/calcHash.js";
import { handleOSCommand } from "./task2-modules/handleOSCommand.js";
import { readFile, addFile, moveFile, renameFile, removeFile, copyFile, makeDirectory } from "./task2-modules/filesOperations.js";
import { listDirectoryContents } from "./task2-modules/listDerectoryContents.js";
import { printCurrentDirectory } from "./task2-modules/printCurrentDirectory.js";

const args = process.argv.slice(2);
const usernameArg = args.find(arg => arg.startsWith('--username='));
const username = usernameArg ? usernameArg.split('=')[1] : 'Anonymous';

const homeDir = os.homedir();
let currentDir = homeDir;

console.log('\x1b[33m%s\x1b[0m', `Welcome to the File Manager, ${username}!`);
printCurrentDirectory(currentDir);

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
        console.log('\x1b[31m%s\x1b[0m', 'Operation failed');
    }

    printCurrentDirectory(currentDir);
    rl.prompt();
});

async function handleCommand(input) {
    const [command, ...args] = input.split(' ').filter(e=>e!=='');

    switch (command) {
        case 'up':
            moveUp();
            break;

        case 'cd':
            if (!args[0]) return console.log('\x1b[31m%s\x1b[0m', 'Invalid input');
            await changeDirectory(args[0]);
            break;

        case 'ls':
            await listDirectoryContents(currentDir);
            break;

        case 'cat':
            if (!args[0]) return console.log('\x1b[31m%s\x1b[0m', 'Invalid input');
            await readFile(args[0], currentDir);
            break;

        case 'add':
            if (!args[0]) return console.log('\x1b[31m%s\x1b[0m', 'Invalid input');
            await addFile(args[0], currentDir);
            break;

        case 'mkdir':
            if (!args[0]) return console.log('\x1b[31m%s\x1b[0m', 'Invalid input');
            await makeDirectory(args[0], currentDir);
            break;

        case 'rn':
            if (args.length < 2) return console.log('\x1b[31m%s\x1b[0m', 'Invalid input');
            await renameFile(args[0], args[1], currentDir);
            break;

        case 'cp':
            if (args.length < 2) return console.log('\x1b[31m%s\x1b[0m', 'Invalid input');
            await copyFile(args[0], args[1], currentDir);
            break;

        case 'mv':
            if (args.length < 2) return console.log('\x1b[31m%s\x1b[0m', 'Invalid input');
            await moveFile(args[0], args[1], currentDir);
            break;

        case 'rm':
            if (!args[0]) return console.log('\x1b[31m%s\x1b[0m', 'Invalid input');
            await removeFile(args[0], currentDir);
            break;

        case 'os':
            await handleOSCommand(args[0]);
            break;

        case 'hash':
            if (!args[0]) return console.log('\x1b[31m%s\x1b[0m', 'Invalid input');
            await hashFile(args[0], currentDir);
            break;

        case 'compress':
            if (args.length < 2) return console.log('\x1b[31m%s\x1b[0m', 'Invalid input');
            await compressFile(args[0], args[1], currentDir);
            break;

        case 'decompress':
            if (args.length < 2) return console.log('\x1b[31m%s\x1b[0m', 'Invalid input');
            await decompressFile(args[0], args[1], currentDir);
            break;

        default:
            console.log('\x1b[31m%s\x1b[0m', 'Invalid input');
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

function exitProgram() {
    const message = `Thank you for using File Manager, ${username}, goodbye!\n`;
    process.stdout.write(`\x1b[33m${message}\x1b[0m`);
    rl.close();
    process.nextTick(() => process.exit(0));
}