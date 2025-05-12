import http from 'http';
import { router } from './router/router';

export const app = http.createServer(async (req, res) => {
  try {
    await router(req, res);
  } catch (error) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Internal Server Error' }));
  }
});
