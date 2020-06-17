const express = require('express');
const cors = require('cors');

const { uuid, isUuid } = require('uuidv4');

const PORT = 3334;
const app = express();
const projects = [];

const logRequests = (req, res, next) => {
  const { method, url } = req;
  const logLabel = `[${method.toUpperCase()}]\t ${url}`;
  console.time(logLabel);
  next();
  console.timeEnd(logLabel);
};

const validateProjectId = (req, res, next) => {
  const { id } = req.params;
  if (!isUuid(id)) {
    return res.status(400).json({error: 'Invalid project id'});
  }

  return next();
}

app.use(cors());
app.use(express.json());
app.use(logRequests);
app.use('/projects/:id', validateProjectId);

app.get('/projects', ( req, res) => {
  const { title } = req.query;
  const results = title
    ? projects.filter(project => project.title.includes(title))
    : projects;
  return res.json(results);
});
app.post('/projects', (req, res) => {
  const { title, owner } = req.body;
  const project = {
    id: uuid(),
    title,
    owner,
  };
  projects.push(project);

  return res.json(project);
});
app.put(
  '/projects/:id', (req, res) => {
  const { id } = req.params;
  const { title, owner } = req.body;

  const projectIndex = projects.findIndex(project => project.id === id);

  if (projectIndex < 0) {
    return res.status(404).json({error: 'Project not found'});
  }
  const project = {
    id,
    title,
    owner
  }
  projects[projectIndex] = project;

  return res.json(project);
});
app.delete('/projects/:id', (req, res) => {
  const { id } = req.params;
  const projectIndex = projects.findIndex(project => project.id === id);

  if (projectIndex < 0) {
    return res.status(404).json({error: 'Project not found'});
  }

  projects.splice(projectIndex, 1);

  return res.status(204).send();
});
app.listen(PORT, () => {
  console.log('🚀 Back-end started!');
});