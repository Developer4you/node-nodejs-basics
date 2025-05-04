import os from 'os';
import readline from 'readline';
import process from 'process';

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