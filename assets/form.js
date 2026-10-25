// Contact and subscribe forms: sends each form to its action (radiantmaps.co/api/contact) without leaving the page,
// then shows the form's own thank-you or error text. Uses the same attributes the sites' CSS styles:
// [data-fs-success], [data-fs-error] (the form's message) and [data-fs-error="field"] get data-fs-active when shown;
// invalid fields get aria-invalid; the [data-fs-submit-btn] is disabled while sending. window.formRedirect, when set,
// is where a successful send goes instead (a thank-you page). hotmail\\.com|mail\\.ru comes from common.BLOCKED_EMAIL_DOMAINS.
(() => {
  const blocked = new RegExp('@(?:[^@]*\\.)?(?:hotmail\\.com|mail\\.ru)$', 'i');

  // refuse those addresses as they are typed, so the browser won't send the form
  document.addEventListener('input', (e) => {
    const i = e.target;
    if (i.type === 'email') i.setCustomValidity(blocked.test(i.value.trim()) ? 'Please use a different email address.' : '');
  });

  const show = (el, text) => {
    if (!el) return;
    if (text !== undefined) el.textContent = text;
    el.setAttribute('data-fs-active', '');
  };

  for (const form of document.querySelectorAll('form[action*="/api/contact"]')) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const button = form.querySelector('[data-fs-submit-btn]');
      const general = form.querySelector('[data-fs-error=""]');
      for (const el of form.querySelectorAll('[data-fs-active]')) el.removeAttribute('data-fs-active');
      for (const el of form.querySelectorAll('[data-fs-error]:not([data-fs-error=""])')) el.textContent = '';
      for (const el of form.querySelectorAll('[aria-invalid]')) el.removeAttribute('aria-invalid');
      if (button) button.disabled = true;
      form.setAttribute('aria-busy', 'true');
      try {
        const res = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
        const body = await res.json().catch(() => ({}));
        if (res.ok) {
          if (window.formRedirect) { location.href = window.formRedirect; return; }
          form.reset();
          show(form.querySelector('[data-fs-success]'));
        } else if (body.errors) {
          for (const { field, message } of body.errors) {
            const box = form.querySelector(`[data-fs-error="${field}"]`);
            show(box || general, message);
            form.querySelector(`[name="${field}"]`)?.setAttribute('aria-invalid', 'true');
          }
        } else {
          show(general, body.error || 'Something went wrong. Please try again.');
        }
      } catch {
        show(general, 'The message could not be sent. Please check your connection and try again.');
      } finally {
        if (button) button.disabled = false;
        form.removeAttribute('aria-busy');
      }
    });
  }
})();
