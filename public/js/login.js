// Agent Login Handler
document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('loginForm');
  const errorBox = document.getElementById('loginError');
  const submitBtn = document.getElementById('loginBtn');

  if (!form) return;

  // If already logged in, redirect to dashboard
  try {
    const supabase = await window.getSupabase();
    const { data } = await supabase.auth.getUser();
    if (data?.user) {
      window.location.href = '/dashboard';
      return;
    }
  } catch (e) {
    // Continue
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!email || !password) return;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Logging in...';
    errorBox.style.display = 'none';

    try {
      const supabase = await window.getSupabase();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new Error(error.message);
      }

      window.location.href = '/dashboard';
    } catch (err) {
      errorBox.textContent = err.message || 'Login failed. Please check credentials.';
      errorBox.style.display = 'block';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Log In';
    }
  });
});
