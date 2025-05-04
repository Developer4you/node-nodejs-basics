import os from 'os';
import path from 'path';
import readline from 'readline';
import process from 'process';
import fs from 'fs/promises';

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
            if (!args[0]) {
                console.log('Invalid input');
                return;
            }
            await changeDirectory(args[0]);
            break;

        case 'ls':
            await listDirectoryContents();
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
