import { Patients, Records } from '../db.js';
import { esc, formatDateJp, calcAge, scoreColor } from '../utils.js';
import { renderScoreChart } from '../chart.js';

export async function renderPatientDetail(root, params) {
  const patient = await Patients.get(params.id);
  if (!patient) {
    root.innerHTML = `<div class="screen"><div class="empty-state">患者が見つかりません</div></div>`;
    return;
  }
  const records = await Records.byPatient(params.id);
  const age = calcAge(patient.birthDate);

  const recordRows = records
    .slice()
    .reverse()
    .map(
      (r) => `
      <a href="#/patients/${patient.id}/records/${r.id}" class="record-card">
        <div class="record-card-date">${formatDateJp(r.date)}</div>
        <div class="record-card-mid">
          <div class="record-card-site">${esc(r.site) || '部位未記入'}</div>
          <div class="record-card-code">${esc(r.code)}</div>
        </div>
        <span class="score-pill ${scoreColor(r.totalScore)}">${r.totalScore}点</span>
      </a>`
    )
    .join('');

  root.innerHTML = `
    <header class="app-header">
      <a href="#/patients" class="header-back" aria-label="戻る">‹</a>
      <div class="app-header-title">${esc(patient.name)}</div>
      <a href="#/patients/${patient.id}/edit" class="header-action" aria-label="編集">編集</a>
    </header>
    <div class="screen">
      <div class="patient-summary">
        <div class="patient-summary-name">${esc(patient.name)}</div>
        <div class="patient-summary-sub">${age !== null ? age + '歳 ' : ''}${esc(patient.gender)}${patient.facility ? ' ・ ' + esc(patient.facility) : ''}</div>
        ${patient.memo ? `<div class="patient-summary-memo">${esc(patient.memo)}</div>` : ''}
      </div>

      <div class="section">
        <div class="section-title">DESIGN-R®︎ 合計点の経過</div>
        <div class="chart-wrap">${renderScoreChart(records)}</div>
      </div>

      <div class="section-links">
        <a href="#/patients/${patient.id}/gallery" class="section-link-card">
          <span class="section-link-icon">🖼️</span>
          <span>経過写真ギャラリー</span>
          <span class="chevron">›</span>
        </a>
      </div>

      <div class="section">
        <div class="section-title-row">
          <div class="section-title">記録一覧</div>
        </div>
        <div class="record-list">
          ${recordRows || `<div class="empty-state">まだ記録がありません。右下の + から記録してください。</div>`}
        </div>
      </div>
    </div>
    <a href="#/patients/${patient.id}/records/new" class="fab" aria-label="記録を追加">+</a>
  `;
}
