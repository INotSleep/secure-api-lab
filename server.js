const express = require('express');
const { users, documents, employees } = require('./data');

const app = express();
const PORT = process.env.PORT ?? 3000;

const loggingMiddleware = (req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
};

const authMiddleware = (req, res, next) => {
  const login = req.headers['x-login'];
  const password = req.headers['x-password'];
  const user = users.find((u) => u.login === login && u.password === password);

  if (!user) {
    return res.status(401).json({
      message: 'Authentication failed. Please provide valid credentials in headers X-Login and X-Password.',
    });
  }

  req.user = user;
  next();
};

const adminOnlyMiddleware = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin role required.' });
  }
  next();
};

app.use(express.json());
app.use(loggingMiddleware);

app.get('/', (req, res) => {
  res.send('Hello World! The server is running.');
});

app.get('/documents', authMiddleware, (req, res) => {
  res.status(200).json(documents);
});

app.post('/documents', authMiddleware, (req, res) => {
  const { title, content } = req.body ?? {};

  if (!title || !content) {
    return res
      .status(400)
      .json({ message: 'Bad Request. Fields "title" and "content" are required.' });
  }

  const document = { id: Date.now(), title, content };
  documents.push(document);
  res.status(201).json(document);
});

app.delete('/documents/:id', authMiddleware, (req, res) => {
  const index = documents.findIndex((doc) => doc.id === Number(req.params.id));

  if (index === -1) {
    return res.status(404).json({ message: 'Document not found' });
  }

  documents.splice(index, 1);
  res.status(204).send();
});

app.get('/employees', authMiddleware, adminOnlyMiddleware, (req, res) => {
  res.status(200).json(employees);
});

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((err, req, res, next) => {
  res.status(err.status ?? 500).json({ message: err.message });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
