// Dashboard Queue & Filters Handler
document.addEventListener('DOMContentLoaded', async () => {
  const queueContainer = document.getElementById('ticketsQueue');
  const emptyState = document.getElementById('emptyState');
  const categoryFilter = document.getElementById('categoryFilter');
  const urgencyFilter = document.getElementById('urgencyFilter');
  const visibleCount = document.getElementById('visibleCount');

  if (!queueContainer) return;

  let allTickets = [];

  try {
    const supabase = await window.getSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = '/login';
      return;
    }

    const { data: tickets, error } = await supabase
      .from('tickets')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    allTickets = tickets || [];

    // Populate category dropdown
    const categories = Array.from(new Set(allTickets.map(t => t.category).filter(Boolean)));
    categories.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat;
      opt.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
      categoryFilter.appendChild(opt);
    });

    renderTickets();

    categoryFilter.addEventListener('change', renderTickets);
    urgencyFilter.addEventListener('change', renderTickets);

  } catch (err) {
    console.error('Error loading dashboard:', err);
    queueContainer.innerHTML = `<div class="alert alert-error">Failed to load tickets: ${err.message}</div>`;
  }

  function renderTickets() {
    const catVal = categoryFilter.value;
    const urgVal = urgencyFilter.value;

    const filtered = allTickets.filter(t => {
      const matchCat = catVal === 'all' || t.category === catVal;
      const matchUrg = urgVal === 'all' || t.urgency === urgVal;
      return matchCat && matchUrg;
    });

    visibleCount.textContent = `${filtered.length} of ${allTickets.length} tickets visible`;

    if (filtered.length === 0) {
      queueContainer.innerHTML = '';
      emptyState.style.display = 'block';
      return;
    }

    emptyState.style.display = 'none';

    queueContainer.innerHTML = filtered.map(t => {
      const urgClass = t.urgency === 'high' ? 'high' : t.urgency === 'medium' ? 'medium' : 'low';
      const createdDate = new Date(t.created_at).toLocaleDateString('en-US');

      return `
        <a href="/tickets/${t.id}" class="ticket-item">
          <div class="ticket-item-content">
            <div>
              <h3 class="ticket-subject">${escapeHtml(t.subject)}</h3>
              <div class="ticket-meta">
                <span>${createdDate}</span>
                <span>•</span>
                <span>${escapeHtml(t.category || 'Uncategorized')}</span>
                <span>•</span>
                <span>${escapeHtml(t.sentiment || 'No sentiment')}</span>
                <span>•</span>
                <span>${escapeHtml(t.status || 'open')}</span>
              </div>
            </div>
            <div>
              <span class="urgency-badge">
                <span class="urgency-dot ${urgClass}"></span>
                ${escapeHtml(t.urgency || 'none')}
              </span>
            </div>
          </div>
        </a>
      `;
    }).join('');
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
