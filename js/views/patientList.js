import { Patients, Records } from '../db.js';
import { esc, calcAge } from '../utils.js';

export async function renderPatientList(root) {
  const patients = await Patients.all();

  const rows = await Promise.all(
    patients.map(async (p) => {
      const recs = await Records.byPatient(p.id);
      const last = recs[recs.length - 1];
      const age = calcAge(p.birthDate);
      return `
        <a href="#/patients/${p.id}" class="list-card">
          <div class="list-card-main">
            <div class="list-card-title">${esc(p.name)}</div>
            <div class="list-card-sub">${age !== null ? age + '歳 ' : ''}${p.gender ? esc(p.gender) : ''}${p.facility ? ' ・ ' + esc(p.facility) : ''}</div>
          </div>
          <div class="list-card-side">
            ${
              last
                ? `<span class="score-pill ${last.totalScore === 0 ? 'score-0' : last.totalScore <= 10 ? 'score-low' : last.totalScore <= 20 ? 'score-mid' : 'score-high'}">${last.totalScore}点</span>`
                : `<span class="score-pill score-none">記録なし</span>`
            }
            <span class="chevron">›</span>
          </div>
        </a>`;
    })
  );

  root.innerHTML = `
    <header class="app-header">
      <div class="app-header-title">JOKUSO+</div>
    </header>
    <div class="screen">
      <div class="screen-toolbar">
        <input type="search" id="patient-search" class="search-input" placeholder="患者名で検索" />
      </div>
      <div id="patient-list" class="list">
        ${rows.length ? rows.join('') : `<div class="empty-state">患者が登録されていません。右下の + から追加してください。</div>`}
      </div>
    </div>
    <a href="#/patients/new" class="fab" aria-label="患者を追加">+</a>
  `;

  const searchInput = root.querySelector('#patient-search');
  searchInput.addEventListener('input', () => {
    const q = searchInput.value.trim();
    const cards = root.querySelectorAll('.list-card');
    cards.forEach((card) => {
      const title = card.querySelector('.list-card-title').textContent;
      card.style.display = title.includes(q) ? '' : 'none';
    });
  });
}
