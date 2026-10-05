const express = require('express');
const { documents, employees } = require('./data');

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World! The server is running.');
});

app.get('/documents', (req, res) => {
  res.status(200).json(documents);
});

app.post('/documents', (req, res) => {
  const document = { ...req.body, id: Date.now() };
  documents.push(document);
  res.status(201).json(document);
});

app.get('/employees', (req, res) => {
  res.status(200).json(employees);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
