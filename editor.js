/* EDITABLE BRIEFS (1 Oct 2026).
   Any page named edit-*.html loads this file. It makes the whole page typeable, like a
   Word doc, and puts a Save bar at the bottom. Save commits the page back to this repo
   through the save helper on Netlify (baybella-brief-editor), which holds the GitHub key -
   the key can't live here because this repo is public.

   On open, the page pulls the latest saved version straight from GitHub, so a save shows
   on every device immediately instead of waiting a minute for Pages to rebuild. */
(function () {
  var API = 'https://baybella-brief-editor.netlify.app/.netlify/functions/save';
  var path = decodeURIComponent(location.pathname.split('/').pop());
  var sha = null;
  var dirty = false;
  var saving = false;
  var bar, status, btn;

  function el(tag, css, text) {
    var n = document.createElement(tag);
    if (css) n.style.cssText = css;
    if (text) n.textContent = text;
    return n;
  }

  function setStatus(text, colour) {
    status.textContent = text;
    status.style.color = colour || '#555';
  }

  function buildBar() {
    bar = el('div', 'position:fixed;left:0;right:0;bottom:0;z-index:99999;background:#fff;' +
      'border-top:1px solid #ddd;box-shadow:0 -2px 12px rgba(0,0,0,.08);padding:12px 16px;' +
      'display:flex;align-items:center;justify-content:space-between;gap:12px;' +
      'font:15px/1.3 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif');
    bar.setAttribute('data-editor-ui', '');
    bar.setAttribute('contenteditable', 'false');
    status = el('span', '', 'Loading the latest version...');
    btn = el('button', 'background:#E5147F;color:#fff;border:0;border-radius:8px;padding:10px 22px;' +
      'font:600 15px -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;cursor:pointer;flex:none', 'Save');
    btn.onclick = save;
    bar.appendChild(status);
    bar.appendChild(btn);
    var spacer = el('div', 'height:80px');
    spacer.setAttribute('data-editor-ui', '');
    document.body.appendChild(spacer);
    document.body.appendChild(bar);
  }

  function makeEditable() {
    document.body.contentEditable = 'true';
    document.body.spellcheck = true;
    buildBar();
  }

  function snapshot() {
    var root = document.documentElement.cloneNode(true);
    root.querySelectorAll('[data-editor-ui]').forEach(function (n) { n.remove(); });
    var body = root.querySelector('body');
    body.removeAttribute('contenteditable');
    body.removeAttribute('spellcheck');
    return '<!DOCTYPE html>\n' + root.outerHTML + '\n';
  }

  function save() {
    if (saving) return;
    saving = true;
    btn.disabled = true;
    btn.style.opacity = '.6';
    setStatus('Saving...');
    fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: path, html: snapshot(), sha: sha })
    })
      .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, code: r.status, d: d }; }); })
      .then(function (res) {
        if (res.ok) {
          sha = res.d.sha;
          dirty = false;
          var t = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
          setStatus('Saved at ' + t + '. Everyone who opens this link now sees this version.', '#1a7f37');
        } else if (res.code === 409) {
          setStatus('Someone else saved a newer version while you were editing. Copy your changes, reload, and paste them back in.', '#c0392b');
        } else {
          setStatus('Not saved: ' + (res.d.error || 'something went wrong') + '. Try again.', '#c0392b');
        }
      })
      .catch(function () { setStatus('Not saved - no connection. Try again.', '#c0392b'); })
      .then(function () { saving = false; btn.disabled = false; btn.style.opacity = '1'; });
  }

  function start() {
    fetch(API + '?path=' + encodeURIComponent(path), { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (file) {
        if (file && file.html) {
          sha = file.sha;
          var fresh = new DOMParser().parseFromString(file.html, 'text/html');
          if (fresh.body.innerHTML.trim() !== document.body.innerHTML.trim()) {
            document.body.innerHTML = fresh.body.innerHTML;
          }
        }
        makeEditable();
        setStatus(file ? 'Click anywhere and type to edit. Hit Save when you’re done.'
          : 'Couldn’t check for the latest version. You can still edit and save.');
      })
      .catch(function () {
        makeEditable();
        setStatus('Couldn’t check for the latest version. You can still edit and save.');
      });

    document.addEventListener('input', function () {
      if (!dirty) { dirty = true; setStatus('Unsaved changes', '#b26a00'); }
    });
    // Paste as plain text so text copied from Word or Google Docs doesn't drag its styling in.
    document.addEventListener('paste', function (e) {
      var text = (e.clipboardData || window.clipboardData).getData('text/plain');
      e.preventDefault();
      document.execCommand('insertText', false, text);
    });
    document.addEventListener('keydown', function (e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') { e.preventDefault(); save(); }
    });
    window.addEventListener('beforeunload', function (e) {
      if (dirty) { e.preventDefault(); e.returnValue = ''; }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
