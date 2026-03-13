import serverless from 'serverless-http';
import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'API working' });
});

app.use((req, res) => {
  res.status(404).json({ message: 'Not found' });
});

export default serverless(app);
