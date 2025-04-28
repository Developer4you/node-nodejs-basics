import { Transform } from 'stream';
import { stdin, stdout } from 'process';

const transform = async () => {
    const reverseStream = new Transform({
        transform(chunk, encoding, callback) {
            const reversed = chunk.toString().split('').reverse().join('');
            callback(null, reversed + '\n\n');
        }
    });

    stdin.on('error', () => {
        throw new Error('Input stream error');
    });


    reverseStream.on('error', () => {
        throw new Error('Transform stream error');
    });

    stdout.on('error', () => {
        throw new Error('Output stream error');
    });

    console.log('Input the text and press ENTER')

    stdin.pipe(reverseStream).pipe(stdout);
};

await transform();