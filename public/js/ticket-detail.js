// Ticket Detail & AI Reply Draft Handler
document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('ticketDetailContainer');
  if (!container) return;

  // Extract ticket ID from /tickets/:id or ?id=...
  let ticketId = window.location.pathname.split('/tickets/')[1];
  if (!ticketId) {
    const params = new URLSearchParams(window.location.search);
    ticketId = params.get('id');
  }

  if (!ticketId) {
    container.innerHTML = '<div class="alert alert-error">Invalid Ticket ID</div>';
    return;
  }

  try {
    const supabase = await window.getSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = '/login';
      return;
    }

    // 1. Fetch ticket details
    const { data: ticket, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('id', ticketId)
      .single();

    if (error || !ticket) {
      container.innerHTML = '<div class="alert alert-error">Ticket not found or has been removed.</div>';
      return;
    }

    // 2. Fetch similar tickets
    let similarTickets = [];
    try {
      const simRes = await fetch('/api/similar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId }),
      });
      const simData = await simRes.json();
      similarTickets = simData.similar || [];
    } catch (e) {
      console.warn('Could not fetch similar tickets:', e);
    }

    // Render Full Ticket Details
    renderTicketDetail(ticket, similarTickets);

  } catch (err) {
    console.error('Error loading ticket detail:', err);
    container.innerHTML = `<div class="alert alert-error">Failed to load ticket: ${err.message}</div>`;
  }

  function renderTicketDetail(ticket, similarTickets) {
    const urgencyClass = ticket.urgency === 'high' ? 'high' : ticket.urgency === 'medium' ? 'medium' : 'low';
    const formattedDate = new Date(ticket.created_at).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    const similarTicketsHtml = similarTickets.length === 0
      ? `
        <div class="empty-state">
          <div class="empty-state-icon">
            <div style="width: 20px; height: 20px; border-radius: 50%; border: 2px solid var(--color-muted); opacity: 0.4;"></div>
          </div>
          <h3 class="title-secondary" style="font-size: 1.125rem;">No similar tickets yet</h3>
          <p class="subtitle-desc" style="max-width: 400px; margin: 0.5rem auto 0;">
            Once comparable issues exist in the knowledge base, matching tickets will appear here with confidence scores.
          </p>
        </div>
      `
      : `
        <div class="tickets-queue">
          ${similarTickets.map(match => {
            const percentage = Math.round(match.similarity * 100);
            return `
              <a href="/tickets/${match.ticket_id}" class="ticket-item">
                <div class="ticket-item-content">
                  <div style="flex: 1; min-width: 0;">
                    <h4 class="ticket-subject">${escapeHtml(match.subject)}</h4>
                    <p class="subtitle-desc" style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin-top: 0.5rem;">
                      ${escapeHtml(match.body)}
                    </p>
                  </div>
                  <div class="progress-bar-container">
                    <p class="progress-label">${percentage}% match</p>
                    <div class="progress-track">
                      <div class="progress-fill" style="width: ${percentage}%;"></div>
                    </div>
                  </div>
                </div>
              </a>
            `;
          }).join('')}
        </div>
      `;

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 2rem;">
        <!-- Header Card -->
        <section class="card">
          <a href="/dashboard" class="back-link">← Back to Dashboard</a>
          <div style="display: flex; flex-wrap: wrap; gap: 0.75rem; align-items: center; margin-bottom: 1rem;">
            ${ticket.category ? `<span class="tag-pill">${escapeHtml(ticket.category)}</span>` : ''}
            <span class="urgency-badge">
              <span class="urgency-dot ${urgencyClass}"></span>
              ${escapeHtml(ticket.urgency || 'none')}
            </span>
            ${ticket.sentiment ? `<span class="tag-pill">${escapeHtml(ticket.sentiment)}</span>` : ''}
            ${ticket.status ? `<span class="tag-pill">${escapeHtml(ticket.status)}</span>` : ''}
          </div>
          <h1 class="title-primary" style="font-size: 2rem; margin-bottom: 0.75rem;">
            ${escapeHtml(ticket.subject)}
          </h1>
          <div style="display: flex; flex-wrap: wrap; gap: 1rem; font-size: 0.875rem; color: var(--color-muted);">
            <span>${escapeHtml(ticket.customer_email)}</span>
            <span>•</span>
            <span style="font-family: var(--font-mono); font-size: 0.8125rem;">${formattedDate}</span>
          </div>
        </section>

        <!-- Customer Message -->
        <section class="card">
          <div class="pill-badge" style="margin-bottom: 0.75rem;">Customer Message</div>
          <p class="message-body">${escapeHtml(ticket.body)}</p>
        </section>

        <!-- Similar Tickets -->
        <section class="card">
          <div class="card-header">
            <h2 class="title-secondary">Similar Past Tickets</h2>
            <p class="subtitle-desc">Compare this issue with the closest historical matches.</p>
          </div>
          ${similarTicketsHtml}
        </section>

        <!-- AI Suggested Reply Section -->
        <section class="card" id="replySection">
          <div class="card-header">
            <h2 class="title-secondary">AI-Suggested Reply</h2>
            <p class="subtitle-desc">Generate a polished starting point, then tune the wording before sending it back to the customer.</p>
          </div>

          <div id="initialDraftBox" style="padding: 1rem 0;">
            <button id="generateBtn" class="btn-primary">Generate Reply Draft</button>
          </div>

          <div id="draftContentBox" style="display: none; display: flex; flex-direction: column; gap: 1rem;">
            <div class="form-group" style="margin-bottom: 0;">
              <label for="draftTextarea" class="form-label">Draft Reply</label>
              <textarea id="draftTextarea" class="form-textarea" rows="8"></textarea>
            </div>
            <div style="display: flex; align-items: center; gap: 1rem;">
              <button id="regenerateBtn" class="btn-primary">Regenerate</button>
              <span style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--color-muted);">
                Uses ticket context and similar cases as guidance.
              </span>
            </div>
          </div>
        </section>
      </div>
    `;

    // AI Reply Actions
    const initialDraftBox = document.getElementById('initialDraftBox');
    const draftContentBox = document.getElementById('draftContentBox');
    const draftTextarea = document.getElementById('draftTextarea');
    const generateBtn = document.getElementById('generateBtn');
    const regenerateBtn = document.getElementById('regenerateBtn');

    async function handleGenerate(btn) {
      btn.disabled = true;
      btn.textContent = 'Generating draft...';

      try {
        const res = await fetch('/api/draft-reply', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subject: ticket.subject,
            body: ticket.body,
            similarTickets,
          }),
        });
        const data = await res.json();
        draftTextarea.value = data.draft || '';

        initialDraftBox.style.display = 'none';
        draftContentBox.style.display = 'flex';
      } catch (e) {
        alert('Failed to generate draft: ' + e.message);
      } finally {
        btn.disabled = false;
        btn.textContent = btn === regenerateBtn ? 'Regenerate' : 'Generate Reply Draft';
      }
    }

    generateBtn.addEventListener('click', () => handleGenerate(generateBtn));
    regenerateBtn.addEventListener('click', () => handleGenerate(regenerateBtn));
  }

  function escapeHtml(text) {
    if (!text) return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
});
