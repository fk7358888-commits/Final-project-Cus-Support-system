const workspaceData = {
  cafe: {
    name: 'Ember & Grain',
    type: 'Cafe',
    open: 18,
    response: '12m',
    satisfaction: '96.4%',
    resolved: 42,
    total: 52,
    channels: [['Chat', 31, '#69cfa9'], ['Email', 15, '#ff866d'], ['Instagram', 12, '#bcb2f3'], ['Phone', 8, '#f2c998']],
    tickets: [
      { id: 1, initials: 'MC', customer: 'Maya Chen', subject: 'My loyalty points did not apply to my order', time: '8 min ago', status: 'waiting', statusText: 'Waiting on us', avatar: 'avatar-lilac', unread: true, message: 'Hi team, I placed an order this morning and noticed my loyalty points were not added. Could you take a look at the receipt and help me get them added to my account?', note: 'Order #EG-2841 was completed today. Customer has 1,240 points on their account.' },
      { id: 2, initials: 'JD', customer: 'Jordan Davis', subject: 'Is the oat milk latte available iced?', time: '24 min ago', status: 'open', statusText: 'Open', avatar: 'avatar-peach', unread: true, message: 'Hello! I am planning to stop by this afternoon. Can I order the oat milk latte iced, and is it possible to make it decaf?', note: 'Saved reply available: Menu and drink customisation.' },
      { id: 3, initials: 'SF', customer: 'Samira Flores', subject: 'Question about catering for next Friday', time: '1 hr ago', status: 'open', statusText: 'Open', avatar: 'avatar-blue', unread: false, message: 'We are hosting a team breakfast next Friday and would love to know what catering options you offer for around 25 people.', note: 'Catering lead. Ask for event time and dietary requirements.' },
      { id: 4, initials: 'LE', customer: 'Liam Evans', subject: 'Table reservation for Saturday evening', time: '2 hrs ago', status: 'snoozed', statusText: 'Snoozed', avatar: 'avatar-mint', unread: false, message: 'Could I reserve a table for four this Saturday around 7pm?', note: 'Snoozed until Friday at 9:00 AM.' },
      { id: 5, initials: 'NK', customer: 'Nora Kim', subject: 'Refund request for duplicate charge', time: '3 hrs ago', status: 'open', statusText: 'Open', avatar: 'avatar-lilac', unread: false, message: 'I see two charges for the same order on my card. Please help me check which one should be refunded.', note: 'Payment issue. Verify the two transaction references before refunding.' }
    ]
  },
  salon: {
    name: 'Vela Studio',
    type: 'Beauty salon',
    open: 11,
    response: '18m',
    satisfaction: '94.8%',
    resolved: 31,
    total: 39,
    channels: [['Instagram', 22, '#bcb2f3'], ['Chat', 14, '#69cfa9'], ['Email', 9, '#ff866d'], ['Phone', 6, '#f2c998']],
    tickets: [
      { id: 11, initials: 'AM', customer: 'Aisha Malik', subject: 'Can I move my appointment to Thursday?', time: '5 min ago', status: 'waiting', statusText: 'Waiting on us', avatar: 'avatar-lilac', unread: true, message: 'Hi Vela team, something came up with my schedule. Is there any availability to move my colour appointment to Thursday afternoon?', note: 'Current booking: Wednesday, 3:30 PM with Elena.' },
      { id: 12, initials: 'RB', customer: 'Ruby Bell', subject: 'Which products are safe for sensitive skin?', time: '32 min ago', status: 'open', statusText: 'Open', avatar: 'avatar-peach', unread: true, message: 'I have very sensitive skin and wanted to ask which of your facial products would be the best fit before I book.', note: 'Send the sensitive skin consultation guide.' },
      { id: 13, initials: 'TS', customer: 'Theo Singh', subject: 'Gift card purchase help', time: '1 hr ago', status: 'open', statusText: 'Open', avatar: 'avatar-blue', unread: false, message: 'I would like to purchase a gift card for my sister. Can I choose a specific treatment?', note: 'Gift cards are available for all services over $50.' },
      { id: 14, initials: 'OW', customer: 'Olivia Wright', subject: 'Late cancellation fee question', time: '3 hrs ago', status: 'snoozed', statusText: 'Snoozed', avatar: 'avatar-mint', unread: false, message: 'I had to cancel my appointment due to an emergency. Can the cancellation fee be waived?', note: 'Snoozed until manager reviews the request.' }
    ]
  },
  quran: {
    name: 'Noor Academy',
    type: 'Quran & Tajweed',
    open: 14,
    response: '9m',
    satisfaction: '98.1%',
    resolved: 38,
    total: 47,
    channels: [['WhatsApp', 20, '#69cfa9'], ['Email', 13, '#ff866d'], ['Chat', 10, '#bcb2f3'], ['Phone', 4, '#f2c998']],
    tickets: [
      { id: 21, initials: 'ZA', customer: 'Zainab Ahmed', subject: 'Trial lesson timing for my daughter', time: '4 min ago', status: 'waiting', statusText: 'Waiting on us', avatar: 'avatar-lilac', unread: true, message: 'Assalamu alaikum. I would like to book a trial lesson for my 9-year-old daughter. Do you have any weekday evening times available?', note: 'Family is in GMT+4. Preferred teacher: Ustadha Maryam.' },
      { id: 22, initials: 'HK', customer: 'Hassan Khan', subject: 'How do I access the Tajweed workbook?', time: '18 min ago', status: 'open', statusText: 'Open', avatar: 'avatar-peach', unread: true, message: 'Assalamu alaikum, I enrolled yesterday but cannot see the Tajweed workbook in my student portal. Could you help?', note: 'Enrollment is active. Send the student portal access guide.' },
      { id: 23, initials: 'SA', customer: 'Sara Ali', subject: 'Request to change class level', time: '1 hr ago', status: 'open', statusText: 'Open', avatar: 'avatar-blue', unread: false, message: 'After the assessment, I think the intermediate group may be a better fit. Can my class level be updated?', note: 'Teacher assessment requested.' },
      { id: 24, initials: 'YM', customer: 'Yusuf Mahmoud', subject: 'Payment receipt for monthly plan', time: '2 hrs ago', status: 'snoozed', statusText: 'Snoozed', avatar: 'avatar-mint', unread: false, message: 'Could you send me a receipt for this month\'s Quran class subscription?', note: 'Snoozed until billing sync completes.' }
    ]
  }
};

let currentWorkspace = 'cafe';
let activeFilter = 'all';
let searchTerm = '';
let extraTicketsVisible = false;

const $ = (selector) => document.querySelector(selector);
const ticketList = $('#ticketList');

function renderMetrics(data) {
  $('#breadcrumbWorkspace').textContent = data.name;
  $('#openTickets').textContent = data.open;
  $('#inboxCount').textContent = data.open;
  $('#allCount').textContent = data.open;
  $('#responseTime').textContent = data.response;
  $('#satisfaction').textContent = data.satisfaction;
  $('#resolvedTickets').textContent = data.resolved;
  $('#totalConversations').textContent = data.total;
}

function renderChannels(data) {
  const colors = data.channels.map((channel) => channel[2]);
  const values = data.channels.map((channel) => channel[1]);
  const total = values.reduce((sum, value) => sum + value, 0);
  let start = 0;
  const segments = data.channels.map((channel) => {
    const end = start + (channel[1] / total) * 360;
    const segment = `${channel[2]} ${start}deg ${end}deg`;
    start = end;
    return segment;
  });
  $('#donutChart').style.background = `conic-gradient(${segments.join(', ')})`;
  $('#channelLegend').innerHTML = data.channels.map((channel, index) => `<div class="legend-row"><i style="background:${colors[index]}"></i><span>${channel[0]}</span><strong>${Math.round((channel[1] / total) * 100)}%</strong></div>`).join('');
}

function visibleTickets(data) {
  let list = data.tickets.filter((ticket) => {
    if (activeFilter === 'mine') return ticket.id % 2 === 1;
    if (activeFilter === 'unassigned') return ticket.id % 2 === 0;
    return true;
  });
  if (searchTerm) {
    list = list.filter((ticket) => `${ticket.customer} ${ticket.subject}`.toLowerCase().includes(searchTerm));
  }
  return extraTicketsVisible ? list : list.slice(0, 4);
}

function renderTickets() {
  const tickets = visibleTickets(workspaceData[currentWorkspace]);
  if (!tickets.length) {
    ticketList.innerHTML = '<div class="empty-state">No conversations match that search.</div>';
    return;
  }
  ticketList.innerHTML = tickets.map((ticket) => `<article class="ticket-row ${ticket.unread ? 'is-unread' : ''}" data-ticket-id="${ticket.id}">
    <span class="avatar ${ticket.avatar}">${ticket.initials}</span>
    <div class="ticket-main"><div class="ticket-customer"><strong>${ticket.customer}</strong>${ticket.unread ? '<span class="unread-count">new</span>' : ''}</div><p class="ticket-subject">${ticket.subject}</p></div>
    <div class="ticket-meta"><time class="ticket-time">${ticket.time}</time><span class="status-tag ${ticket.status}">${ticket.statusText}</span></div>
  </article>`).join('');
  ticketList.querySelectorAll('.ticket-row').forEach((row) => row.addEventListener('click', () => openTicket(Number(row.dataset.ticketId))));
}

function renderWorkspace() {
  const data = workspaceData[currentWorkspace];
  document.body.dataset.workspace = currentWorkspace;
  renderMetrics(data);
  renderChannels(data);
  renderTickets();
}

function openTicket(ticketId) {
  const ticket = workspaceData[currentWorkspace].tickets.find((item) => item.id === ticketId);
  if (!ticket) return;
  $('#drawerTitle').textContent = ticket.subject;
  $('#drawerBody').innerHTML = `<div class="conversation-meta"><span class="avatar ${ticket.avatar}">${ticket.initials}</span><div><strong>${ticket.customer}</strong><small>Customer via ${currentWorkspace === 'cafe' ? 'Instagram' : currentWorkspace === 'salon' ? 'Email' : 'WhatsApp'} · ${ticket.time}</small></div><span class="status-tag ${ticket.status} conversation-status">${ticket.statusText}</span></div><div class="conversation-copy"><h3>${ticket.subject}</h3><p>${ticket.message}</p><div class="conversation-note">${ticket.note}</div></div>`;
  $('#ticketDrawer').classList.add('is-open');
  $('#drawerBackdrop').classList.add('is-open');
  $('#ticketDrawer').setAttribute('aria-hidden', 'false');
}

function closeDrawer() {
  $('#ticketDrawer').classList.remove('is-open');
  $('#drawerBackdrop').classList.remove('is-open');
  $('#ticketDrawer').setAttribute('aria-hidden', 'true');
}

function openModal() { $('#modalBackdrop').classList.add('is-open'); $('#modalBackdrop input').focus(); }
function closeModal() { $('#modalBackdrop').classList.remove('is-open'); $('#newTicketForm').reset(); }
function openCustomerInfo() { $('#customerInfoBackdrop').classList.add('is-open'); $('#customerInfoBackdrop').setAttribute('aria-hidden', 'false'); }
function closeCustomerInfo() { $('#customerInfoBackdrop').classList.remove('is-open'); $('#customerInfoBackdrop').setAttribute('aria-hidden', 'true'); }

function openAnalytics() {
  const data = workspaceData[currentWorkspace];
  const resolution = Math.round((data.resolved / (data.resolved + data.open)) * 100);
  $('#analyticsContext').textContent = `${data.name} performance overview`;
  $('#analysisSummary').textContent = `${data.name} resolved ${data.resolved} conversations this week while keeping first response time at ${data.response}. Customer satisfaction is ${data.satisfaction}.`;
  $('#analysisResolution').textContent = `${resolution}%`;
  $('#analysisWorkload').textContent = `${data.open} tickets`;
  $('#analysisResolutionMeter').style.width = `${resolution}%`;
  $('#analysisWorkloadMeter').style.width = `${Math.min(data.open * 4, 100)}%`;
  $('#analysisChannels').innerHTML = data.channels.map((channel) => `<div class="analysis-channel-row"><span>${channel[0]}</span><div><i style="width:${Math.round((channel[1] / data.total) * 100)}%"></i></div><strong>${Math.round((channel[1] / data.total) * 100)}%</strong></div>`).join('');
  $('#analyticsBackdrop').classList.add('is-open');
  $('#analyticsBackdrop').setAttribute('aria-hidden', 'false');
}

function closeAnalytics() { $('#analyticsBackdrop').classList.remove('is-open'); $('#analyticsBackdrop').setAttribute('aria-hidden', 'true'); }

function addTicket(event) {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const data = workspaceData[currentWorkspace];
  data.tickets.unshift({ id: Date.now(), initials: formData.get('customer').split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase(), customer: formData.get('customer'), subject: formData.get('subject'), time: 'just now', status: 'open', statusText: 'Open', avatar: 'avatar-mint', unread: true, message: formData.get('message'), note: 'Newly created ticket. Assign a teammate when ready.' });
  data.open += 1;
  closeModal();
  renderWorkspace();
}

document.querySelectorAll('.workspace-item').forEach((button) => button.addEventListener('click', () => {
  currentWorkspace = button.dataset.workspace;
  document.querySelectorAll('.workspace-item').forEach((item) => item.classList.toggle('is-active', item === button));
  extraTicketsVisible = false;
  renderWorkspace();
}));

document.querySelectorAll('.filter-tab').forEach((button) => button.addEventListener('click', () => {
  activeFilter = button.dataset.filter;
  document.querySelectorAll('.filter-tab').forEach((item) => item.classList.toggle('is-active', item === button));
  renderTickets();
}));

$('#ticketSearch').addEventListener('input', (event) => { searchTerm = event.target.value.trim().toLowerCase(); renderTickets(); });
$('#loadMore').addEventListener('click', () => { extraTicketsVisible = true; renderTickets(); $('#loadMore').textContent = 'Showing all conversations'; });
$('#closeDrawer').addEventListener('click', closeDrawer);
$('#drawerBackdrop').addEventListener('click', closeDrawer);
$('#newTicketButton').addEventListener('click', openCustomerInfo);
$('#closeModal').addEventListener('click', closeModal);
$('#cancelModal').addEventListener('click', closeModal);
$('#modalBackdrop').addEventListener('click', (event) => { if (event.target === $('#modalBackdrop')) closeModal(); });
$('#customerInfoButton').addEventListener('click', openCustomerInfo);
$('#closeCustomerInfo').addEventListener('click', closeCustomerInfo);
$('#customerInfoBackdrop').addEventListener('click', (event) => { if (event.target === $('#customerInfoBackdrop')) closeCustomerInfo(); });
$('#analyticsButton').addEventListener('click', openAnalytics);
$('#closeAnalytics').addEventListener('click', closeAnalytics);
$('#analyticsBackdrop').addEventListener('click', (event) => { if (event.target === $('#analyticsBackdrop')) closeAnalytics(); });
$('#newTicketForm').addEventListener('submit', addTicket);
$('#mobileMenu').addEventListener('click', () => $('#sidebar').classList.toggle('is-open'));
document.addEventListener('keydown', (event) => { if (event.key === 'Escape') { closeDrawer(); closeModal(); closeCustomerInfo(); closeAnalytics(); $('#sidebar').classList.remove('is-open'); } });

renderWorkspace();
