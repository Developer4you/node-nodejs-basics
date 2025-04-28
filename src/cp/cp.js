import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const spawnChildProcess = async (args) => {
    const filename = fileURLToPath(import.meta.url);
    const dirname = path.dirname(filename)+'/files';

    const scriptPath = path.join(dirname, 'script.js');
    const child = spawn('node', [scriptPath, ...args]);

    process.stdin.pipe(child.stdin);
    child.stdout.pipe(process.stdout);

    return child;
};

// Put your arguments in function call to test this functionality
spawnChildProcess( ['someArg', 'anotherArg', 'anotherArg2','anotherArg3']);
