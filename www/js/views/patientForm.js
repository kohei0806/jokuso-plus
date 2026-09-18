import { Patients } from '../db.js';
import { esc } from '../utils.js';

export async function renderPatientForm(root, params) {
  const isEdit = !!params.id;
  const patient = isEdit ? await Patients.get(params.id) : null;

  root.innerHTML = `
    <header class="app-header">
      <a href="${isEdit ? '#/patients/' + params.id : '#/patients'}" class="header-back" aria-label="戻る">‹</a>
      <div class="app-header-title">${isEdit ? '患者情報を編集' : '患者を追加'}</div>
    </header>
    <div class="screen">
      <form id="patient-form" class="form">
        <label class="field">
          <span class="field-label">氏名 <span class="required">必須</span></span>
          <input type="text" name="name" required value="${esc(patient?.name)}" placeholder="例) 山田 太郎" />
        </label>
        <label class="field">
          <span class="field-label">患者コード・ID</span>
          <input type="text" name="patientCode" value="${esc(patient?.patientCode)}" placeholder="施設内の管理番号など(任意)" />
        </label>
        <div class="field-row">
          <label class="field">
            <span class="field-label">生年月日</span>
            <input type="date" name="birthDate" value="${esc(patient?.birthDate)}" />
          </label>
          <label class="field field-narrow">
            <span class="field-label">性別</span>
            <select name="gender">
              <option value="">-</option>
              <option value="男性" ${patient?.gender === '男性' ? 'selected' : ''}>男性</option>
              <option value="女性" ${patient?.gender === '女性' ? 'selected' : ''}>女性</option>
              <option value="その他" ${patient?.gender === 'その他' ? 'selected' : ''}>その他</option>
            </select>
          </label>
        </div>
        <label class="field">
          <span class="field-label">施設・訪問先</span>
          <input type="text" name="facility" value="${esc(patient?.facility)}" placeholder="例) ○○訪問看護ステーション" />
        </label>
        <label class="field">
          <span class="field-label">メモ</span>
          <textarea name="memo" rows="3" placeholder="既往歴・体位・注意点など">${esc(patient?.memo)}</textarea>
        </label>
        <div class="form-actions">
          <button type="submit" class="btn btn-primary btn-block">保存する</button>
          ${isEdit ? `<button type="button" id="delete-patient" class="btn btn-danger-outline btn-block">この患者を削除</button>` : ''}
        </div>
      </form>
    </div>
  `;

  const form = root.querySelector('#patient-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const data = {
      name: fd.get('name').trim(),
      patientCode: fd.get('patientCode').trim(),
      birthDate: fd.get('birthDate'),
      gender: fd.get('gender'),
      facility: fd.get('facility').trim(),
      memo: fd.get('memo').trim(),
    };
    if (!data.name) return;

    if (isEdit) {
      await Patients.update({ ...patient, ...data });
      location.hash = `#/patients/${params.id}`;
    } else {
      const id = await Patients.add(data);
      location.hash = `#/patients/${id}`;
    }
  });

  if (isEdit) {
    root.querySelector('#delete-patient').addEventListener('click', async () => {
      if (confirm(`${patient.name}さんの記録・写真をすべて削除します。よろしいですか?`)) {
        await Patients.remove(params.id);
        location.hash = '#/patients';
      }
    });
  }
}
