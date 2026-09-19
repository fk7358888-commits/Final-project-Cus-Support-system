require('dotenv').config({ path: require('node:path').join(__dirname, '..', '.env') });

const express = require('express');
const cors = require('cors');
const fs = require('node:fs');
const path = require('node:path');
const nodemailer = require('nodemailer');
const { Pool } = require('pg');

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const ROOT = path.join(__dirname, '..');
const DATA_FILE = path.join(ROOT, 'data.json');
const useDatabase = Boolean(process.env.DATABASE_URL);
const pool = useDatabase ? new Pool({ connectionString: process.env.DATABASE_URL, ssl: process.env.DATABASE_SSL === 'false' ? false : { rejectUnauthorized: false } }) : null;
const smtpHost = process.env.SMTP_HOST;
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const emailTo = process.env.EMAIL_TO || smtpUser;
const emailFrom = process.env.EMAIL_FROM || smtpUser;

app.use(cors({ origin: process.env.FRONTEND_URL || true }));
app.use(express.json({ limit: '1mb' }));

function readFallback() { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); }
function writeFallback(data) { fs.writeFileSync(DATA_FILE, `${JSON.stringify(data, null, 2)}\n`); }
function initials(customer) { return customer.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase(); }
function publicTicket(ticket) { return { ...ticket, initials: ticket.initials || initials(ticket.customer) }; }
function getFallbackWorkspace(id) { return readFallback().workspaces[id]; }

async function sendTicketEmail(ticket, workspaceName) {
  if (!smtpHost || !smtpUser || !smtpPass || !emailTo) {
    console.log('Email automation skipped: SMTP configuration is incomplete.');
    return { sent: false, reason: 'smtp-not-configured' };
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_PORT === '465',
    auth: { user: smtpUser, pass: smtpPass }
  });

  const message = {
    from: emailFrom,
    to: emailTo,
    subject: `[Support] New ticket from ${ticket.customer} in ${workspaceName}`,
    text: [
      `Workspace: ${workspaceName}`,
      `Customer: ${ticket.customer}`,
      `Subject: ${ticket.subject}`,
      `Message: ${ticket.message}`,
      `Status: ${ticket.status || 'open'}`,
      `Time: ${ticket.time || 'just now'}`
    ].join('\n')
  };

  await transporter.sendMail(message);
  return { sent: true, to: emailTo };
}

async function findWorkspace(id) {
  if (!useDatabase) return getFallbackWorkspace(id);
  const result = await pool.query('SELECT id, name, type, open_tickets AS open, response_time AS response, satisfaction, resolved_tickets AS resolved, total_conversations AS total FROM workspaces WHERE id = $1', [id]);
  return result.rows[0];
}

async function listTickets(workspaceId, query = {}) {
  if (!useDatabase) {
    const workspace = getFallbackWorkspace(workspaceId);
    const search = (query.search || '').toLowerCase();
    return workspace.tickets.filter((ticket) => (!query.status || ticket.status === query.status) && (!search || `${ticket.customer} ${ticket.subject} ${ticket.message}`.toLowerCase().includes(search))).map(publicTicket);
  }
  const values = [workspaceId];
  const filters = ['workspace_id = $1'];
  if (query.status) { values.push(query.status); filters.push(`status = $${values.length}`); }
  if (query.search) { values.push(`%${query.search}%`); filters.push(`(customer ILIKE $${values.length} OR subject ILIKE $${values.length} OR message ILIKE $${values.length})`); }
  const result = await pool.query(`SELECT id, customer, subject, message, status, status_text AS "statusText", time_label AS time FROM tickets WHERE ${filters.join(' AND ')} ORDER BY created_at DESC`, values);
  return result.rows.map(publicTicket);
}

async function requireWorkspace(req, res, next) {
  try {
    req.workspace = await findWorkspace(req.params.workspaceId);
    if (!req.workspace) return res.status(404).json({ error: 'Workspace not found' });
    next();
  } catch (error) { next(error); }
}

app.get('/api/health', async (req, res, next) => {
  try {
    if (useDatabase) await pool.query('SELECT 1');
    res.json({ status: 'ok', service: 'hearthline-support', storage: useDatabase ? 'postgresql' : 'json-fallback', time: new Date().toISOString() });
  } catch (error) { next(error); }
});

app.get('/api/workspaces', async (req, res, next) => {
  try {
    if (!useDatabase) {
      const { workspaces } = readFallback();
      return res.json(Object.entries(workspaces).map(([id, workspace]) => ({ id, name: workspace.name, type: workspace.type, open: workspace.open })));
    }
    const result = await pool.query('SELECT id, name, type, open_tickets AS open FROM workspaces ORDER BY id');
    res.json(result.rows);
  } catch (error) { next(error); }
});

app.get('/api/workspaces/:workspaceId', requireWorkspace, async (req, res, next) => {
  try {
    const tickets = await listTickets(req.params.workspaceId);
    res.json({ id: req.params.workspaceId, ...req.workspace, tickets });
  } catch (error) { next(error); }
});

app.get('/api/workspaces/:workspaceId/tickets', requireWorkspace, async (req, res, next) => {
  try { res.json(await listTickets(req.params.workspaceId, req.query)); } catch (error) { next(error); }
});

app.post('/api/workspaces/:workspaceId/tickets', requireWorkspace, async (req, res, next) => {
  try {
    const { customer, subject, message } = req.body;
    if (!customer || !subject || !message) return res.status(400).json({ error: 'customer, subject, and message are required' });

    if (!useDatabase) {
      const data = readFallback();
      const ticket = { id: Date.now(), customer, subject, message, status: 'open', statusText: 'Open', time: 'just now' };
      data.workspaces[req.params.workspaceId].tickets.unshift(ticket);
      data.workspaces[req.params.workspaceId].open += 1;
      data.workspaces[req.params.workspaceId].total += 1;
      writeFallback(data);

      try {
        await sendTicketEmail(publicTicket(ticket), req.workspace.name);
      } catch (error) {
        console.warn('Failed to send email automation for fallback storage', error);
      }

      return res.status(201).json(publicTicket(ticket));
    }

    const result = await pool.query('INSERT INTO tickets (workspace_id, customer, subject, message, status, status_text, time_label) VALUES ($1, $2, $3, $4, \'open\', \'Open\', \'just now\') RETURNING id, customer, subject, message, status, status_text AS "statusText", time_label AS time', [req.params.workspaceId, customer, subject, message]);
    await pool.query('UPDATE workspaces SET open_tickets = open_tickets + 1, total_conversations = total_conversations + 1 WHERE id = $1', [req.params.workspaceId]);

    const createdTicket = publicTicket(result.rows[0]);
    try {
      await sendTicketEmail(createdTicket, req.workspace.name);
    } catch (error) {
      console.warn('Failed to send email automation for database-backed ticket', error);
    }

    res.status(201).json(createdTicket);
  } catch (error) { next(error); }
});

app.get('/api/workspaces/:workspaceId/tickets/:ticketId', requireWorkspace, async (req, res, next) => {
  try {
    if (!useDatabase) {
      const ticket = getFallbackWorkspace(req.params.workspaceId).tickets.find((item) => item.id === Number(req.params.ticketId));
      return ticket ? res.json(publicTicket(ticket)) : res.status(404).json({ error: 'Ticket not found' });
    }
    const result = await pool.query('SELECT id, customer, subject, message, status, status_text AS "statusText", time_label AS time FROM tickets WHERE workspace_id = $1 AND id = $2', [req.params.workspaceId, req.params.ticketId]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Ticket not found' });
    res.json(publicTicket(result.rows[0]));
  } catch (error) { next(error); }
});

app.get('/api/analytics', async (req, res, next) => {
  try {
    const workspaceId = req.query.workspace || 'cafe';
    const workspace = await findWorkspace(workspaceId);
    if (!workspace) return res.status(404).json({ error: 'Workspace not found' });
    let channels;
    if (useDatabase) {
      const result = await pool.query('SELECT channel, COUNT(*)::int AS count FROM tickets WHERE workspace_id = $1 GROUP BY channel ORDER BY count DESC', [workspaceId]);
      channels = result.rows.map((row) => [row.channel, row.count]);
    } else channels = getFallbackWorkspace(workspaceId).channels;
    const resolutionRate = Math.round((workspace.resolved / (workspace.resolved + workspace.open)) * 100);
    res.json({ workspace: workspaceId, name: workspace.name, open: workspace.open, response: workspace.response, satisfaction: workspace.satisfaction, resolved: workspace.resolved, resolutionRate, channels });
  } catch (error) { next(error); }
});

app.use(express.static(ROOT));
app.use((error, req, res, next) => { console.error(error); res.status(500).json({ error: 'Internal server error' }); });
app.listen(PORT, () => console.log(`Hearthline support running at http://localhost:${PORT} (${useDatabase ? 'PostgreSQL' : 'JSON fallback'})`));
