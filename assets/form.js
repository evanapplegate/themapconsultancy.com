// Contact and subscribe forms: sends each form to its action (radiantmaps.co/api/contact) without leaving the page,
// then shows the form's own thank-you or error text. Uses the same attributes the sites' CSS styles:
// [data-fs-success], [data-fs-error] (the form's message) and [data-fs-error="field"] get data-fs-active when shown;
// invalid fields get aria-invalid; the [data-fs-submit-btn] is disabled while sending. window.formRedirect, when set,
// is where a successful send goes instead (a thank-you page). hotmail\\.com|mail\\.ru comes from common.BLOCKED_EMAIL_DOMAINS.
//
// Spam check: Cloudflare Turnstile (sitekey 0x4AAAAAAF1eEu79g6hBTZzS from common.TURNSTILE_SITEKEY). Its script loads only once
// someone clicks into a form, checks the browser in the background and hands over a one-time token, which goes with
// the form; the handler asks Cloudflare whether it's valid. It shows a checkbox (at the end of the form) only when it
// can't tell. Local previews use Cloudflare's always-passing test key, whose token the handler refuses.
(() => {
  const blocked = new RegExp('@(?:[^@]*\\.)?(?:hotmail\\.com|mail\\.ru)$', 'i');
  const sitekey = /^(localhost|127\.0\.0\.1)$/.test(location.hostname) ? '1x00000000000000000000AA' : '0x4AAAAAAF1eEu79g6hBTZzS';

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

  let api; // promise of window.turnstile, once its script is asked for
  const loadApi = () => api ||= new Promise((resolve, reject) => {
    window.onTurnstileLoad = () => resolve(window.turnstile);
    const s = document.createElement('script');
    s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=onTurnstileLoad';
    s.async = true;
    s.onerror = () => { api = null; reject(new Error('blocked')); };
    document.head.append(s);
  });

  // each form's widget: its id, its current token, and sends waiting for one
  const widgets = new Map();
  const arm = (form) => {
    if (widgets.has(form)) return widgets.get(form);
    const w = { token: null, waiting: [] };
    const settle = (t) => { w.token = t; for (const f of w.waiting.splice(0)) f(t); };
    widgets.set(form, w);
    loadApi().then((ts) => {
      const box = document.createElement('div');
      box.className = 'cf-turnstile';
      form.append(box);
      w.reset = () => { w.token = null; ts.reset(w.id); };
      w.id = ts.render(box, {
        sitekey, appearance: 'interaction-only',
        callback: settle,
        'expired-callback': () => { w.token = null; },
        'error-callback': () => settle(null),
      });
    }).catch(() => { widgets.delete(form); settle(null); });
    return w;
  };
  // the form's token, waiting for it if the check is still running (or for the visitor to tick the box)
  const token = (form) => {
    const w = arm(form);
    return w.token ? Promise.resolve(w.token) : new Promise((resolve) => {
      w.waiting.push(resolve);
      setTimeout(() => resolve(null), 20000);
    });
  };
  document.addEventListener('focusin', (e) => {
    const form = e.target.closest?.('form[action*="/api/contact"]');
    if (form) arm(form);
  });

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
        const t = await token(form);
        if (!t) {
          show(general, 'We couldn’t check that you’re not a bot. If a checkbox appeared, tick it, then send again.');
          return;
        }
        const data = new FormData(form);
        data.set('cf-turnstile-response', t);
        const res = await fetch(form.action, { method: 'POST', body: data, headers: { Accept: 'application/json' } });
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
        widgets.get(form)?.reset?.(); // a token works once: get the next one ready
        if (button) button.disabled = false;
        form.removeAttribute('aria-busy');
      }
    });
  }
})();
