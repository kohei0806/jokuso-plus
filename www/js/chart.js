// 経過グラフ (SVG による軽量折れ線グラフ、外部ライブラリ不使用)

export function renderScoreChart(records) {
  const width = 100; // viewBox 単位(%指定で親要素に追従)
  const height = 46;
  const padL = 10;
  const padR = 4;
  const padT = 6;
  const padB = 10;
  const plotW = width - padL - padR;
  const plotH = height - padT - padB;

  if (records.length === 0) {
    return `<div class="chart-empty">記録がまだありません</div>`;
  }

  const maxScore = 66; // DESIGN-R 合計点の理論上限
  const points = records.map((r, i) => {
    const x = records.length === 1 ? padL + plotW / 2 : padL + (plotW * i) / (records.length - 1);
    const y = padT + plotH - (plotH * Math.min(r.totalScore, maxScore)) / maxScore;
    return { x, y, r };
  });

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ');

  const gridLines = [0, 20, 40, 60].map((v) => {
    const y = padT + plotH - (plotH * v) / maxScore;
    return `<line x1="${padL}" y1="${y}" x2="${width - padR}" y2="${y}" class="chart-grid" />
      <text x="${padL - 2}" y="${y + 1.5}" class="chart-axis-label" text-anchor="end">${v}</text>`;
  }).join('');

  const dots = points
    .map(
      (p) =>
        `<circle cx="${p.x.toFixed(2)}" cy="${p.y.toFixed(2)}" r="1.6" class="chart-dot" data-score="${p.r.totalScore}" data-date="${p.r.date}"><title>${p.r.date} 合計${p.r.totalScore}点</title></circle>`
    )
    .join('');

  const firstDate = records[0].date;
  const lastDate = records[records.length - 1].date;

  return `
    <svg viewBox="0 0 ${width} ${height}" class="chart-svg" preserveAspectRatio="none">
      ${gridLines}
      <path d="${pathD}" class="chart-line" fill="none" />
      ${dots}
      <text x="${padL}" y="${height - 1}" class="chart-axis-label">${firstDate}</text>
      <text x="${width - padR}" y="${height - 1}" class="chart-axis-label" text-anchor="end">${lastDate}</text>
    </svg>
  `;
}
