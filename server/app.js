import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { rankFreelancers, normalizeSkills } from './matching.js';
import { seedFreelancers, seedTasks } from './data.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, '..', 'public');

let taskCounter = 0;

function nextTaskId() {
  taskCounter += 1;
  return `tk-${String(100 + taskCounter)}`;
}

export function createApp({ freelancers = seedFreelancers(), tasks = seedTasks() } = {}) {
  const app = express();

  app.use(express.json({ limit: '64kb' }));
  app.use(express.static(publicDir, { maxAge: '1h' }));

  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'kliko-global',
      freelancers: freelancers.length,
      tasks: tasks.length
    });
  });

  app.get('/api/freelancers', (req, res) => {
    const skill = String(req.query.skill ?? '').trim().toLowerCase();
    const list = skill
      ? freelancers.filter((f) => normalizeSkills(f.skills).includes(skill))
      : freelancers;
    res.json({ count: list.length, freelancers: list });
  });

  app.get('/api/tasks', (_req, res) => {
    res.json({ count: tasks.length, tasks });
  });

  app.post('/api/tasks', (req, res) => {
    const body = req.body ?? {};
    const title = String(body.title ?? '').trim();
    if (!title) {
      return res.status(400).json({ error: 'title is required' });
    }

    const budget = Number(body.budget ?? 0);
    if (body.budget !== undefined && (!Number.isFinite(budget) || budget < 0)) {
      return res.status(400).json({ error: 'budget must be a non-negative number' });
    }

    const task = {
      id: nextTaskId(),
      title,
      description: String(body.description ?? '').trim(),
      skills: normalizeSkills(body.skills),
      budget,
      client: String(body.client ?? 'Anonymous client').trim() || 'Anonymous client',
      status: 'open',
      createdAt: new Date().toISOString()
    };

    tasks.push(task);
    const matches = rankFreelancers(task, freelancers).slice(0, 5);
    res.status(201).json({ task, matches });
  });

  app.get('/api/tasks/:id/matches', (req, res) => {
    const task = tasks.find((t) => t.id === req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'task not found' });
    }
    const limit = Math.min(Math.max(Number(req.query.limit) || 5, 1), freelancers.length);
    const matches = rankFreelancers(task, freelancers).slice(0, limit);
    res.json({ task, matches });
  });

  app.post('/api/match', (req, res) => {
    const body = req.body ?? {};
    const task = {
      skills: normalizeSkills(body.skills),
      budget: Number(body.budget) || 0
    };
    const matches = rankFreelancers(task, freelancers).slice(0, 5);
    res.json({ matches });
  });

  app.use('/api', (_req, res) => {
    res.status(404).json({ error: 'not found' });
  });

  // Single-page fallback for non-API routes.
  app.use((req, res) => {
    if (req.method !== 'GET') {
      return res.status(404).json({ error: 'not found' });
    }
    res.sendFile(path.join(publicDir, 'index.html'));
  });

  return app;
}
