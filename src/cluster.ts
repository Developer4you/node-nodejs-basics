import cluster from 'cluster';
import os from 'os';
import http from 'http';
import { Agent } from 'http';

if (cluster.isPrimary) {
  const PORT = process.env.PORT ? parseInt(process.env.PORT) : 4000;
  const cpuCount = os.cpus().length - 1;
  const workersPorts: number[] = [];

  for (let i = 0; i < cpuCount; i++) {
    const workerPort = PORT + i + 1;
    workersPorts.push(workerPort);
    const worker = cluster.fork({ PORT: workerPort.toString() });

    worker.on('message', (msg) => {
      if (msg.event === 'db-events') {
        // Рассылаем сообщение всем воркерам
        for (const id in cluster.workers) {
          cluster.workers[id]?.send(msg);
        }
      }
    });
  }

  const agent = new Agent({ keepAlive: true });
  let currentWorker = 0;

  http
    .createServer((clientReq, clientRes) => {
      const targetPort = workersPorts[currentWorker];
      currentWorker = (currentWorker + 1) % workersPorts.length;

      const proxyReq = http.request(
        {
          hostname: 'localhost',
          port: targetPort,
          path: clientReq.url,
          method: clientReq.method,
          headers: clientReq.headers
        },
        (proxyRes) => {
          clientRes.writeHead(proxyRes.statusCode || 500, proxyRes.headers);
          proxyRes.pipe(clientRes);
        }
      );

      proxyReq.on('error', (err) => {
        console.error('Proxy error:', err);
        clientRes.writeHead(500);
        clientRes.end('Internal server error');
      });

      clientReq.pipe(proxyReq);
    })
    .listen(PORT, () => {
      console.log(`Load balancer running on port ${PORT}`);
    });
} else {
  require('./index');
}
