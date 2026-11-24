import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../server/app.js';

async function withServer(run) {
  const app = createApp();
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  const { port } = server.address();
  const base = `http://127.0.0.1:${port}`;
  try {
    await run(base);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

test('health endpoint reports the service is up', async () => {
  await withServer(async (base) => {
    const res = await fetch(`${base}/api/health`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.status, 'ok');
    assert.equal(body.service, 'kliko-global');
    assert.ok(body.freelancers > 0);
  });
});

test('posting a task returns ranked matches, best skill overlap first', async () => {
  await withServer(async (base) => {
    const res = await fetch(`${base}/api/tasks`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        title: 'Build a ranking endpoint',
        description: 'Score freelancers for marketplace tasks',
        skills: ['node.js', 'ranking', 'postgresql'],
        budget: 900,
        client: 'Test Client'
      })
    });
    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.task.title, 'Build a ranking endpoint');
    assert.deepEqual(body.task.skills, ['node.js', 'ranking', 'postgresql']);
    assert.ok(body.matches.length >= 3);

    const top = body.matches[0];
    assert.deepEqual(top.matchedSkills.sort(), ['node.js', 'postgresql', 'ranking']);
    assert.ok(top.score >= body.matches[1].score, 'matches must be sorted by score');

    const fetched = await fetch(`${base}/api/tasks/${body.task.id}/matches`);
    assert.equal(fetched.status, 200);
    const fetchedBody = await fetched.json();
    assert.equal(fetchedBody.task.id, body.task.id);
    assert.equal(fetchedBody.matches[0].id, top.id);
  });
});

test('task creation validates input and unknown tasks return 404', async () => {
  await withServer(async (base) => {
    const missingTitle = await fetch(`${base}/api/tasks`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ description: 'no title' })
    });
    assert.equal(missingTitle.status, 400);
    assert.match((await missingTitle.json()).error, /title is required/);

    const badBudget = await fetch(`${base}/api/tasks`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ title: 'Bad budget', budget: -5 })
    });
    assert.equal(badBudget.status, 400);

    const missingTask = await fetch(`${base}/api/tasks/does-not-exist/matches`);
    assert.equal(missingTask.status, 404);
  });
});

test('skill filter narrows the freelancer pool', async () => {
  await withServer(async (base) => {
    const res = await fetch(`${base}/api/freelancers?skill=figma`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(body.count >= 1);
    for (const freelancer of body.freelancers) {
      assert.ok(freelancer.skills.includes('figma'));
    }
  });
});

test('static UI is served from the same port', async () => {
  await withServer(async (base) => {
    const res = await fetch(`${base}/`);
    assert.equal(res.status, 200);
    const html = await res.text();
    assert.match(html, /Kliko Global/);
  });
});
