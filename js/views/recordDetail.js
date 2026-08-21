import { Records, Photos, Patients } from '../db.js';
import { DESIGNR_ITEMS, ITEM_ORDER, findOption } from '../designr.js';
import { esc, formatDateJp, scoreColor } from '../utils.js';
import { blobToUrl } from '../image.js';

export async function renderRecordDetail(root, params) {
  const patient = await Patients.get(params.id);
  const record = await Records.get(params.recordId);
  if (!record) {
    root.innerHTML = `<div class="screen"><div class="empty-state">記録が見つかりません</div></div>`;
    return;
  }
  const photos = await Photos.byRecord(params.recordId);

  const itemRows = ['D', ...ITEM_ORDER]
    .map((key) => {
      const item = DESIGNR_ITEMS[key];
      const opt = findOption(key, record.scores[key]);
      return `
        <div class="detail-item-row">
          <div class="detail-item-key">${key}</div>
          <div class="detail-item-body">
            <div class="detail-item-name">${esc(item.label)}</div>
            <div class="detail-item-value">${opt ? `${opt.code} ${esc(opt.label)}` : '-'}</div>
          </div>
          ${item.scored ? `<div class="detail-item-score">${opt ? opt.value : 0}</div>` : ''}
        </div>`;
    })
    .join('');

  const photoHtml = photos
    .map(
      (p) => `<a class="photo-thumb photo-thumb-view" href="${blobToUrl(p.blob)}" target="_blank" rel="noopener">
        <img src="${blobToUrl(p.thumb)}" alt="経過写真" />
      </a>`
    )
    .join('');

  root.innerHTML = `
    <header class="app-header">
      <a href="#/patients/${params.id}" class="header-back" aria-label="戻る">‹</a>
      <div class="app-header-title">${formatDateJp(record.date)}の記録</div>
      <a href="#/patients/${params.id}/records/${params.recordId}/edit" class="header-action" aria-label="編集">編集</a>
    </header>
    <div class="screen">
      <div class="detail-summary">
        <div class="detail-summary-top">
          <span class="score-pill score-pill-lg ${scoreColor(record.totalScore)}">${record.totalScore}点</span>
          <span class="detail-code">${esc(record.code)}</span>
        </div>
        <div class="detail-meta">${esc(patient?.name)} ・ ${esc(record.site) || '部位未記入'}</div>
        ${record.memo ? `<div class="detail-memo">${esc(record.memo)}</div>` : ''}
      </div>

      ${photoHtml ? `<div class="section"><div class="section-title">写真</div><div class="photo-grid">${photoHtml}</div></div>` : ''}

      <div class="section">
        <div class="section-title">DESIGN-R®︎ 項目詳細</div>
        <div class="detail-item-list">${itemRows}</div>
      </div>
    </div>
  `;
}
