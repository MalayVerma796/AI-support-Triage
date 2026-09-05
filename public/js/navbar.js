// Common Navigation Bar Component
document.addEventListener('DOMContentLoaded', async () => {
  const navContainer = document.getElementById('navbar');
  if (!navContainer) return;

  const pathname = window.location.pathname;

  let user = null;
  try {
    const supabase = await window.getSupabase();
    const { data } = await supabase.auth.getUser();
    user = data?.user || null;
  } catch (e) {
    // offline or not configured
  }

  let rightContent = '';
  if (pathname === '/login' || pathname.endsWith('login.html')) {
    rightContent = '<a href="/" class="nav-link">Back to ticket form</a>';
  } else if (pathname === '/' || pathname.endsWith('index.html')) {
    if (user) {
      rightContent = '<a href="/dashboard" class="nav-link">Dashboard</a>';
    } else {
      rightContent = '<a href="/login" class="nav-link">Agent Login</a>';
    }
  } else {
    // Authenticated pages like /dashboard, /ticket.html, etc.
    if (user) {
      rightContent = '<button id="logoutBtn" class="btn-link">Log out</button>';
    } else {
      rightContent = '<a href="/login" class="nav-link">Agent Login</a>';
    }
  }

  navContainer.innerHTML = `
    <header class="navbar">
      <div class="navbar-container">
        <a href="/" class="navbar-brand">Triage</a>
        <div class="navbar-links">
          ${rightContent}
        </div>
      </div>
    </header>
  `;

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      const supabase = await window.getSupabase();
      await supabase.auth.signOut();
      window.location.href = '/login';
    });
  }
});
