// DESIGN-R®2020 の項目定義とスコア計算ロジック
// 出典: 日本褥瘡学会 DESIGN-R®2020 に準拠した項目・重症度区分

export const ITEM_ORDER = ['E', 'S', 'I', 'G', 'N', 'P'];

export const DESIGNR_ITEMS = {
  D: {
    key: 'D',
    label: '深さ',
    sub: 'Depth',
    scored: false, // 深さは合計点に含めない(創が治癒に近づくと深さの判定が不能になるため)
    options: [
      { code: 'd0', value: 0, label: '皮膚損傷・発赤なし' },
      { code: 'd1', value: 1, label: '持続する発赤' },
      { code: 'd2', value: 2, label: '真皮までの損傷' },
      { code: 'D3', value: 3, label: '皮下組織までの損傷' },
      { code: 'D4', value: 4, label: '皮下組織を超える損傷' },
      { code: 'D5', value: 5, label: '関節腔、体腔に至る損傷' },
      { code: 'DDTI', value: 99, label: '深部損傷褥瘡(DTI)疑い' },
      { code: 'DU', value: 99, label: '壊死組織で覆われ深さ判定が不能' },
    ],
  },
  E: {
    key: 'E',
    label: '滲出液',
    sub: 'Exudate',
    scored: true,
    options: [
      { code: 'e0', value: 0, label: 'なし' },
      { code: 'e1', value: 1, label: '少量:毎日のドレッシング交換を要しない' },
      { code: 'e3', value: 3, label: '中等量:1日1回のドレッシング交換を要する' },
      { code: 'E6', value: 6, label: '多量:1日2回以上のドレッシング交換を要する' },
    ],
  },
  S: {
    key: 'S',
    label: '大きさ',
    sub: 'Size(長径×短径 cm²)',
    scored: true,
    options: [
      { code: 's0', value: 0, label: '皮膚損傷なし' },
      { code: 's3', value: 3, label: '4未満' },
      { code: 's6', value: 6, label: '4以上16未満' },
      { code: 's8', value: 8, label: '16以上36未満' },
      { code: 's9', value: 9, label: '36以上64未満' },
      { code: 's12', value: 12, label: '64以上100未満' },
      { code: 'S15', value: 15, label: '100以上' },
    ],
  },
  I: {
    key: 'I',
    label: '炎症/感染',
    sub: 'Inflammation/Infection',
    scored: true,
    options: [
      { code: 'i0', value: 0, label: '局所の炎症徴候なし' },
      { code: 'i1', value: 1, label: '局所の炎症徴候あり(創周囲の発赤・腫脹・熱感・疼痛)' },
      { code: 'i3', value: 3, label: '局所の明らかな感染徴候あり(炎症徴候・膿・悪臭など)' },
      { code: 'I3C', value: 3, label: '臨界的定着疑い(ぬめり・多量の滲出液・脆弱な肉芽など)' },
      { code: 'I9', value: 9, label: '全身的影響あり(発熱など)' },
    ],
  },
  G: {
    key: 'G',
    label: '肉芽組織',
    sub: 'Granulation tissue',
    scored: true,
    options: [
      { code: 'g0', value: 0, label: '治癒または創が浅いため評価不可' },
      { code: 'g1', value: 1, label: '良性肉芽が創面の90%以上' },
      { code: 'g3', value: 3, label: '良性肉芽が創面の50%以上90%未満' },
      { code: 'g4', value: 4, label: '良性肉芽が創面の10%以上50%未満' },
      { code: 'g5', value: 5, label: '良性肉芽が創面の10%未満' },
      { code: 'G6', value: 6, label: '良性肉芽が全く形成されていない' },
    ],
  },
  N: {
    key: 'N',
    label: '壊死組織',
    sub: 'Necrotic tissue',
    scored: true,
    options: [
      { code: 'n0', value: 0, label: '壊死組織なし' },
      { code: 'n3', value: 3, label: '柔らかい壊死組織あり' },
      { code: 'N6', value: 6, label: '硬く厚い密着した壊死組織あり' },
    ],
  },
  P: {
    key: 'P',
    label: 'ポケット',
    sub: 'Pocket(ポケット全周 − 潰瘍面積 cm²)',
    scored: true,
    options: [
      { code: 'p0', value: 0, label: 'ポケットなし' },
      { code: 'P6', value: 6, label: '4未満' },
      { code: 'P9', value: 9, label: '4以上16未満' },
      { code: 'P12', value: 12, label: '16以上36未満' },
      { code: 'P24', value: 24, label: '36以上' },
    ],
  },
};

export function findOption(itemKey, code) {
  const item = DESIGNR_ITEMS[itemKey];
  if (!item) return null;
  return item.options.find((o) => o.code === code) || null;
}

// scores: { D, E, S, I, G, N, P } それぞれ code 文字列 (例: 'e3')
export function calcTotalScore(scores) {
  let total = 0;
  for (const key of ITEM_ORDER) {
    const opt = findOption(key, scores[key]);
    if (opt) total += opt.value;
  }
  return total;
}

// DESIGN-R コード文字列を生成 例: D3-e3s6i1g3N6p0
export function buildCode(scores) {
  const dOpt = findOption('D', scores.D);
  const dPart = dOpt ? dOpt.code : 'd0';
  const rest = ITEM_ORDER.map((key) => {
    const opt = findOption(key, scores[key]);
    return opt ? opt.code : '';
  }).join('');
  return `${dPart}-${rest}`;
}

export function defaultScores() {
  return { D: 'd0', E: 'e0', S: 's0', I: 'i0', G: 'g0', N: 'n0', P: 'p0' };
}
