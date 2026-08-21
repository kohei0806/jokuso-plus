import { Patients, Photos } from '../db.js';
import { esc, formatDateJp } from '../utils.js';
import { blobToUrl } from '../image.js';

export async function renderGallery(root, params) {
  const patient = await Patients.get(params.id);
  const photos = await Photos.byPatient(params.id);

  const grid = photos
    .map(
      (p) => `
      <a class="gallery-item" href="#/patients/${params.id}/records/${p.recordId}">
        <img src="${blobToUrl(p.thumb)}" alt="経過写真" loading="lazy" />
        <span class="gallery-item-date">${formatDateJp(p.date)}</span>
      </a>`
    )
    .join('');

  root.innerHTML = `
    <header class="app-header">
      <a href="#/patients/${params.id}" class="header-back" aria-label="戻る">‹</a>
      <div class="app-header-title">${esc(patient?.name)} の経過写真</div>
    </header>
    <div class="screen">
      ${grid ? `<div class="gallery-grid">${grid}</div>` : `<div class="empty-state">まだ写真がありません</div>`}
    </div>
  `;
}
