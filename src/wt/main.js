import { Worker } from 'worker_threads';
import os from 'os';

const performCalculations = async () => {
    const cpuCount = os.cpus().length;

    async function runWorkers() {
        const workerPromises = [];

        for (let i = 0; i < cpuCount; i++) {
            const worker = new Worker('./src/wt/worker.js');
            const data = 10 + i;

            const promise = new Promise((resolve) => {
                let resolved = false;

                const resolveOnce = (result) => {
                    if (!resolved) {
                        resolved = true;
                        resolve(result);
                        worker.terminate();
                    }
                };

                worker.postMessage(data);

                worker.once('message', (message) => {
                    const status = (message === null) ? 'error' : 'resolved';
                    resolveOnce({status, data: message});
                });

                worker.once('error', () => {
                    resolveOnce({status: 'error', data: null});
                });

                worker.once('exit', () => {
                    resolveOnce({status: 'error', data: null});
                });
            });

            workerPromises.push(promise);
        }

        const results = await Promise.all(workerPromises);
        console.log(results);
    }

    runWorkers().catch(console.error);
}

await performCalculations();