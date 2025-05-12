import http from 'http';
import dotenv from 'dotenv';
import { router } from './router/router';

dotenv.config();

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 4000;
const index = http.createServer(async (req, res) => {
  try {
    await router(req, res);
  } catch (error) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Internal Server Error' }));
  }
});

index.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
