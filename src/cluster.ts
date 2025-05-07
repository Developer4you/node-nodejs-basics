import cluster from 'cluster';
import os from 'os';

if (cluster.isPrimary) {
    const cpuCount = os.cpus().length - 1;
    for (let i = 0; i < cpuCount; i++) {
        cluster.fork({ PORT: Number(process.env.PORT) + i + 1 });
    }

    // Балансировка нагрузки
    let workerIndex = 0;
    cluster.on('message', (worker, message) => {
        const workers = Object.values(cluster.workers);
        workers[workerIndex].send(message);
        workerIndex = (workerIndex + 1) % workers.length;
    });
} else {
    import('./server.js');
}