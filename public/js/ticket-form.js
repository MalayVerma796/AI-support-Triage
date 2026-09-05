// Ticket Submission Handler
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('ticketForm');
  const messageBox = document.getElementById('formMessage');
  const submitBtn = document.getElementById('submitBtn');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const subject = document.getElementById('subject').value.trim();
    const body = document.getElementById('body').value.trim();
    const email = document.getElementById('email').value.trim();

    if (!subject || !body || !email) return;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';
    messageBox.style.display = 'none';
    messageBox.className = 'alert';

    try {
      // 1. Ask AI to categorize ticket
      const catRes = await fetch('/api/categorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, body }),
      });
      const categorization = await catRes.json();

      // 2. Insert into Supabase
      const supabase = await window.getSupabase();
      const { data: insertedTicket, error } = await supabase
        .from('tickets')
        .insert({
          subject,
          body,
          customer_email: email,
          category: categorization.category || 'other',
          urgency: categorization.urgency || 'low',
          sentiment: categorization.sentiment || 'neutral',
        })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      // 3. Generate background embedding
      if (insertedTicket) {
        fetch('/api/embed', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ticketId: insertedTicket.id,
            subject,
            body,
          }),
        }).catch((err) => console.warn('Embedding error:', err));
      }

      // Success
      messageBox.className = 'alert alert-success';
      messageBox.textContent = 'Ticket submitted successfully! Our team and AI triage will review it.';
      messageBox.style.display = 'block';
      form.reset();
    } catch (err) {
      messageBox.className = 'alert alert-error';
      messageBox.textContent = `Error: ${err.message || 'Something went wrong.'}`;
      messageBox.style.display = 'block';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Ticket';
    }
  });
});
