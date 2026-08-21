import { Records, Photos, Patients } from '../db.js';
import { DESIGNR_ITEMS, ITEM_ORDER, calcTotalScore, buildCode, defaultScores } from '../designr.js';
import { esc, todayStr } from '../utils.js';
import { compressImage, blobToUrl } from '../image.js';

const MAX_PHOTOS = 4;

function itemGroupHtml(itemKey, selectedCode) {
  const item = DESIGNR_ITEMS[itemKey];
  const optionsHtml = item.options
    .map((opt) => {
      const checked = opt.code === selectedCode ? 'checked' : '';
      return `
        <label class="chip-option ${checked ? 'is-checked' : ''}">
          <input type="radio" name="item-${itemKey}" value="${opt.code}" ${checked} />
          <span class="chip-code">${opt.code}</span>
          <span class="chip-label">${esc(opt.label)}</span>
        </label>`;
    })
    .join('');

  return `
    <fieldset class="item-group" data-item="${itemKey}">
      <legend class="item-group-legend">
        <span class="item-group-key">${itemKey}</span>
        <span class="item-group-name">${esc(item.label)}</span>
        <span class="item-group-sub">${esc(item.sub)}</span>
      </legend>
      <div class="chip-options">${optionsHtml}</div>
    </fieldset>`;
}

export async function renderRecordForm(root, params) {
  const isEdit = !!params.recordId;
  const patient = await Patients.get(params.id);
  const record = isEdit ? await Records.get(params.recordId) : null;
  const scores = record ? { ...record.scores } : defaultScores();
  const existingPhotos = isEdit ? await Photos.byRecord(params.recordId) : [];

  // pendingPhotos: { key, fullBlob, thumbBlob, url, existingId? }
  const pendingPhotos = existingPhotos.map((p) => ({
    key: `existing-${p.id}`,
    existingId: p.id,
    fullBlob: p.blob,
    thumbBlob: p.thumb,
    url: blobToUrl(p.thumb),
  }));

  root.innerHTML = `
    <header class="app-header">
      <a href="${isEdit ? '#/patients/' + params.id + '/records/' + params.recordId : '#/patients/' + params.id}" class="header-back" aria-label="戻る">‹</a>
      <div class="app-header-title">${isEdit ? '記録を編集' : `${esc(patient?.name)} さんの記録`}</div>
    </header>
    <div class="screen screen-with-stickybar">
      <form id="record-form" class="form">
        <div class="field-row">
          <label class="field">
            <span class="field-label">記録日 <span class="required">必須</span></span>
            <input type="date" name="date" required value="${record?.date || todayStr()}" />
          </label>
          <label class="field">
            <span class="field-label">部位</span>
            <input type="text" name="site" value="${esc(record?.site)}" placeholder="例) 仙骨部" />
          </label>
        </div>

        ${itemGroupHtml('D', scores.D)}
        ${ITEM_ORDER.map((k) => itemGroupHtml(k, scores[k])).join('')}

        <div class="section">
          <div class="section-title">写真(最大${MAX_PHOTOS}枚・自動圧縮)</div>
          <div id="photo-grid" class="photo-grid"></div>
          <label class="btn btn-secondary photo-add-btn" id="photo-add-label">
            📷 写真を追加
            <input type="file" id="photo-input" accept="image/*" capture="environment" multiple hidden />
          </label>
        </div>

        <label class="field">
          <span class="field-label">メモ</span>
          <textarea name="memo" rows="3" placeholder="処置内容・所見など">${esc(record?.memo)}</textarea>
        </label>

        ${isEdit ? `<button type="button" id="delete-record" class="btn btn-danger-outline btn-block">この記録を削除</button>` : ''}
      </form>
    </div>
    <div class="sticky-bar">
      <div class="sticky-score">
        <div class="sticky-score-value" id="live-total">0</div>
        <div class="sticky-score-label">合計点</div>
      </div>
      <div class="sticky-code" id="live-code">-</div>
      <button type="submit" form="record-form" class="btn btn-primary sticky-save">保存</button>
    </div>
  `;

  const form = root.querySelector('#record-form');
  const liveTotal = root.querySelector('#live-total');
  const liveCode = root.querySelector('#live-code');
  const photoGrid = root.querySelector('#photo-grid');
  const photoInput = root.querySelector('#photo-input');
  const photoAddLabel = root.querySelector('#photo-add-label');

  function currentScores() {
    const s = {};
    for (const key of ['D', ...ITEM_ORDER]) {
      const checked = form.querySelector(`input[name="item-${key}"]:checked`);
      s[key] = checked ? checked.value : defaultScores()[key];
    }
    return s;
  }

  function updateLiveScore() {
    const s = currentScores();
    liveTotal.textContent = calcTotalScore(s);
    liveCode.textContent = buildCode(s);
  }

  root.querySelectorAll('.chip-options').forEach((group) => {
    group.addEventListener('change', () => {
      group.querySelectorAll('.chip-option').forEach((label) => {
        label.classList.toggle('is-checked', label.querySelector('input').checked);
      });
      updateLiveScore();
    });
  });

  function renderPhotoGrid() {
    photoGrid.innerHTML = pendingPhotos
      .map(
        (p, i) => `
        <div class="photo-thumb" data-key="${p.key}">
          <img src="${p.url}" alt="写真${i + 1}" />
          <button type="button" class="photo-remove" data-key="${p.key}" aria-label="削除">×</button>
        </div>`
      )
      .join('');
    photoAddLabel.style.display = pendingPhotos.length >= MAX_PHOTOS ? 'none' : '';

    photoGrid.querySelectorAll('.photo-remove').forEach((btn) => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.key;
        const idx = pendingPhotos.findIndex((p) => p.key === key);
        if (idx >= 0) {
          URL.revokeObjectURL(pendingPhotos[idx].url);
          pendingPhotos.splice(idx, 1);
          renderPhotoGrid();
        }
      });
    });
  }
  renderPhotoGrid();

  photoInput.addEventListener('change', async () => {
    const files = Array.from(photoInput.files || []);
    photoInput.value = '';
    const remaining = MAX_PHOTOS - pendingPhotos.length;
    const toProcess = files.slice(0, remaining);
    for (const file of toProcess) {
      try {
        const { full, thumb } = await compressImage(file);
        pendingPhotos.push({
          key: `new-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          fullBlob: full,
          thumbBlob: thumb,
          url: blobToUrl(thumb),
        });
      } catch (err) {
        console.error('画像圧縮に失敗しました', err);
      }
    }
    renderPhotoGrid();
  });

  updateLiveScore();

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const scoresNow = currentScores();
    const data = {
      patientId: Number(params.id),
      date: fd.get('date'),
      site: fd.get('site').trim(),
      memo: fd.get('memo').trim(),
      scores: scoresNow,
      totalScore: calcTotalScore(scoresNow),
      code: buildCode(scoresNow),
    };

    let recordId;
    if (isEdit) {
      recordId = Number(params.recordId);
      await Records.update({ ...record, ...data });
      const stillExistingIds = pendingPhotos.filter((p) => p.existingId).map((p) => p.existingId);
      for (const p of existingPhotos) {
        if (!stillExistingIds.includes(p.id)) await Photos.remove(p.id);
      }
    } else {
      recordId = await Records.add(data);
    }

    for (const p of pendingPhotos) {
      if (!p.existingId) {
        await Photos.add({
          recordId,
          patientId: Number(params.id),
          date: data.date,
          blob: p.fullBlob,
          thumb: p.thumbBlob,
          order: 0,
          createdAt: Date.now(),
        });
      }
    }

    location.hash = `#/patients/${params.id}/records/${recordId}`;
  });

  if (isEdit) {
    root.querySelector('#delete-record').addEventListener('click', async () => {
      if (confirm('この記録を削除します。よろしいですか?')) {
        await Records.remove(params.recordId);
        location.hash = `#/patients/${params.id}`;
      }
    });
  }
}
