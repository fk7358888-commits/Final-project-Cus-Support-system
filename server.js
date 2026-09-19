require('dotenv').config({ path: require('node:path').join(__dirname, '..', '.env') });

const express = require('express');
const cors = require('cors');
const fs = require('node:fs');
const path = require('node:path');

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const ROOT = path.join(__dirname, '..');
const DATA_FILE = path.join(ROOT, 'data.json');

app.use(cors());
app.use(express.json({ limit: '1mb' }));

function readData() {
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, `${JSON.stringify(data, null, 2)}\n`);
}

function publicTicket(ticket) {
  return {
    ...ticket,
    initials: ticket.initials || ticket.customer.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()
  };
}

function getWorkspace(id) {
  return readData().workspaces[id];
}

function requireWorkspace(req, res, next) {
  const workspace = getWorkspace(req.params.workspaceId);
  if (!workspace) return res.status(404).json({ error: 'Workspace not found' });
  req.workspace = workspace;
  next();
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'hearthline-support', time: new Date().toISOString() });
});

app.get('/api/workspaces', (req, res) => {
  const { workspaces } = readData();
  res.json(Object.entries(workspaces).map(([id, workspace]) => ({
    id,
    name: workspace.name,
    type: workspace.type,
    open: workspace.open
  })));
});

app.get('/api/workspaces/:workspaceId', requireWorkspace, (req, res) => {
  res.json({ id: req.params.workspaceId, ...req.workspace, tickets: req.workspace.tickets.map(publicTicket) });
});

app.get('/api/workspaces/:workspaceId/tickets', requireWorkspace, (req, res) => {
  const search = (req.query.search || '').toLowerCase();
  const status = req.query.status;
  const tickets = req.workspace.tickets
    .filter((ticket) => (!status || ticket.status === status) && (!search || `${ticket.customer} ${ticket.subject} ${ticket.message}`.toLowerCase().includes(search)))
    .map(publicTicket);
  res.json(tickets);
});

app.post('/api/workspaces/:workspaceId/tickets', requireWorkspace, (req, res) => {
  const { customer, subject, message } = req.body;
  if (!customer || !subject || !message) return res.status(400).json({ error: 'customer, subject, and message are required' });

  const ticket = {
    id: Date.now(),
    customer,
    subject,
    message,
    status: 'open',
    statusText: 'Open',
    time: 'just now'
  };
  const data = readData();
  data.workspaces[req.params.workspaceId].tickets.unshift(ticket);
  data.workspaces[req.params.workspaceId].open += 1;
  data.workspaces[req.params.workspaceId].total += 1;
  writeData(data);
  res.status(201).json(publicTicket(ticket));
});

app.get('/api/workspaces/:workspaceId/tickets/:ticketId', requireWorkspace, (req, res) => {
  const ticket = req.workspace.tickets.find((item) => item.id === Number(req.params.ticketId));
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
  res.json(publicTicket(ticket));
});

app.get('/api/analytics', (req, res) => {
  const workspaceId = req.query.workspace || 'cafe';
  const workspace = getWorkspace(workspaceId);
  if (!workspace) return res.status(404).json({ error: 'Workspace not found' });
  const resolutionRate = Math.round((workspace.resolved / (workspace.resolved + workspace.open)) * 100);
  res.json({ workspace: workspaceId, name: workspace.name, open: workspace.open, response: workspace.response, satisfaction: workspace.satisfaction, resolved: workspace.resolved, resolutionRate, channels: workspace.channels });
});

app.use(express.static(ROOT));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => console.log(`Hearthline support running at http://localhost:${PORT}`));
