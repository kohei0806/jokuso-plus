import { renderPatientList } from './views/patientList.js';
import { renderPatientForm } from './views/patientForm.js';
import { renderPatientDetail } from './views/patientDetail.js';
import { renderRecordForm } from './views/recordForm.js';
import { renderRecordDetail } from './views/recordDetail.js';
import { renderGallery } from './views/gallery.js';

const root = document.getElementById('app');

const routes = [
  { pattern: /^#\/patients\/new$/, handler: (m) => renderPatientForm(root, {}) },
  { pattern: /^#\/patients\/(\d+)\/edit$/, handler: (m) => renderPatientForm(root, { id: m[1] }) },
  { pattern: /^#\/patients\/(\d+)\/records\/new$/, handler: (m) => renderRecordForm(root, { id: m[1] }) },
  { pattern: /^#\/patients\/(\d+)\/records\/(\d+)\/edit$/, handler: (m) => renderRecordForm(root, { id: m[1], recordId: m[2] }) },
  { pattern: /^#\/patients\/(\d+)\/records\/(\d+)$/, handler: (m) => renderRecordDetail(root, { id: m[1], recordId: m[2] }) },
  { pattern: /^#\/patients\/(\d+)\/gallery$/, handler: (m) => renderGallery(root, { id: m[1] }) },
  { pattern: /^#\/patients\/(\d+)$/, handler: (m) => renderPatientDetail(root, { id: m[1] }) },
  { pattern: /^#\/patients$/, handler: () => renderPatientList(root) },
  { pattern: /^#?$/, handler: () => renderPatientList(root) },
];

async function router() {
  const hash = location.hash || '#/patients';
  for (const route of routes) {
    const m = hash.match(route.pattern);
    if (m) {
      try {
        await route.handler(m);
      } catch (err) {
        console.error(err);
        root.innerHTML = `<div class="screen"><div class="empty-state">エラーが発生しました: ${esc(err.message)}</div></div>`;
      }
      window.scrollTo(0, 0);
      return;
    }
  }
  location.hash = '#/patients';
}

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

window.addEventListener('hashchange', router);
window.addEventListener('DOMContentLoaded', router);
if (document.readyState !== 'loading') router();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch((err) => console.warn('SW登録失敗', err));
  });
}
