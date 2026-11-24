const form = document.getElementById('task-form');
const statusEl = document.getElementById('form-status');
const matchesPanel = document.getElementById('matches-panel');
const matchesSubtitle = document.getElementById('matches-subtitle');
const matchList = document.getElementById('match-list');
const poolEl = document.getElementById('pool');
const statsEl = document.getElementById('stats');

function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.classList.toggle('error', isError);
}

function chip(text) {
  const el = document.createElement('span');
  el.className = 'chip';
  el.textContent = text;
  return el;
}

function renderPool(freelancers) {
  poolEl.replaceChildren();
  for (const freelancer of freelancers) {
    const li = document.createElement('li');
    const left = document.createElement('div');
    const name = document.createElement('div');
    name.className = 'pool-name';
    name.textContent = `${freelancer.name} · ${freelancer.country}`;
    const headline = document.createElement('div');
    headline.className = 'muted';
    headline.textContent = `${freelancer.headline} — $${freelancer.ratePerHour}/h · ★ ${freelancer.rating}`;
    left.append(name, headline);

    const chips = document.createElement('div');
    chips.className = 'chips';
    for (const skill of freelancer.skills) chips.append(chip(skill));

    li.append(left, chips);
    poolEl.append(li);
  }
}

function renderStats(freelancers, tasks) {
  statsEl.replaceChildren();
  const items = [
    `${freelancers} vetted freelancers`,
    `${tasks} open tasks`,
    'Skills + budget + rating scoring'
  ];
  for (const text of items) {
    const el = document.createElement('span');
    el.className = 'stat';
    el.textContent = text;
    statsEl.append(el);
  }
}

function renderMatches(task, matches) {
  matchList.replaceChildren();
  matchesPanel.hidden = false;
  matchesSubtitle.textContent = `Task “${task.title}” · ${matches.length} matches ranked by fit`;

  matches.forEach((match, index) => {
    const li = document.createElement('li');
    li.className = 'match';

    const rank = document.createElement('span');
    rank.className = 'rank';
    rank.textContent = String(index + 1);

    const body = document.createElement('div');
    const name = document.createElement('p');
    name.className = 'match-name';
    name.textContent = `${match.name} · ${match.country}`;
    const headline = document.createElement('p');
    headline.className = 'match-headline';
    headline.textContent = `${match.headline} — $${match.ratePerHour}/h · ★ ${match.rating}`;
    const reasons = document.createElement('ul');
    reasons.className = 'reasons';
    for (const reason of match.reasons) {
      const item = document.createElement('li');
      item.textContent = reason;
      reasons.append(item);
    }
    body.append(name, headline, reasons);

    const score = document.createElement('div');
    score.className = 'score';
    const value = document.createElement('strong');
    value.textContent = String(match.score);
    const label = document.createElement('span');
    label.textContent = 'fit score';
    score.append(value, label);

    li.append(rank, body, score);
    matchList.append(li);
  });

  matchesPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const submitButton = document.getElementById('submit-task');
  const payload = {
    title: document.getElementById('title').value.trim(),
    description: document.getElementById('description').value.trim(),
    skills: document
      .getElementById('skills')
      .value.split(',')
      .map((skill) => skill.trim())
      .filter(Boolean),
    budget: Number(document.getElementById('budget').value) || 0,
    client: document.getElementById('client').value.trim()
  };

  if (!payload.title) {
    setStatus('Add a task title so Kliko can match it.', true);
    return;
  }

  submitButton.disabled = true;
  setStatus('Scoring the freelancer pool…');

  try {
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Could not post the task');
    setStatus(`Task ${data.task.id} posted — matched ${data.matches.length} freelancers.`);
    renderMatches(data.task, data.matches);
  } catch (error) {
    setStatus(error.message, true);
  } finally {
    submitButton.disabled = false;
  }
});

async function init() {
  try {
    const [healthRes, freelancersRes] = await Promise.all([
      fetch('/api/health'),
      fetch('/api/freelancers')
    ]);
    const health = await healthRes.json();
    const pool = await freelancersRes.json();
    renderStats(pool.count, health.tasks);
    renderPool(pool.freelancers);
  } catch {
    setStatus('Could not reach the Kliko API.', true);
  }
}

init();
