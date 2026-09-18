# App Review Information - Notes(審査担当者へのメモ、下書き)

App Store Connect の「App Review Information」→「Notes」欄に貼り付ける用。

---

## 1. アプリの目的と対象ユーザー

JOKUSO+ is a wound-progress recording app for visiting nurses and care-facility nurses in Japan, used to document and visualize pressure ulcers (褥瘡/"jokuso") according to DESIGN-R®, a standard Japanese clinical scoring tool for pressure ulcer severity. Users select the relevant severity option for each of the tool's seven categories (Depth, Exudate, Size, Inflammation/Infection, Granulation tissue, Necrotic tissue, Pocket); the app automatically calculates the total score and a shorthand code, and plots the score over time so nurses can see whether a wound is improving or worsening across visits.

(日本語)
JOKUSO+は、訪問看護師・介護施設の看護師が、褥瘡(じょくそう)の経過をDESIGN-R®(日本の褥瘡重症度評価の標準的な指標)に沿って記録・可視化するためのアプリです。7項目(深さ・滲出液・大きさ・炎症/感染・肉芽組織・壊死組織・ポケット)それぞれについて該当する重症度を選択すると、合計点とコードが自動計算され、経過をグラフで確認できます。

## 2. セットアップ・利用方法

No account, login, or credentials of any kind are required. On first launch, the app shows an empty patient list with a "+" button to add a patient, then a "+" button on the patient's page to add a DESIGN-R® record. No sample data or test credentials are needed to review the app's core flow.

(日本語)
アカウント登録・ログインは一切不要です。初回起動時は空の患者一覧が表示され、「+」ボタンで患者を追加、患者ページの「+」ボタンで記録を追加できます。テスト用のアカウントやサンプルデータは不要です。

## 3. 使用している外部サービス・ツール

The app stores all patient records, DESIGN-R® evaluations, notes, and photos locally on the device only (IndexedDB); none of this data is ever sent to any server. The only network activity is an anonymous, cookie-free page-view counter (GoatCounter, https://www.goatcounter.com/) used solely to measure how often the app is opened, for the developer's own usage insight. This counter does not collect or transmit any patient data, names, or app content — only an anonymous visit event. This is disclosed in the in-app Privacy Policy.

(日本語)
患者の記録・DESIGN-R®評価・メモ・写真はすべて端末内(IndexedDB)にのみ保存され、サーバーには一切送信されません。唯一のネットワーク通信は、開発者が利用状況を把握するための匿名・Cookie不使用のページビュー計測(GoatCounter)のみで、患者データやアプリの内容は一切含まれません。この点はアプリ内のプライバシーポリシーに明記しています。

## 4. 地域による違い

The app provides the same functionality in all regions. There are no region-specific features, content, or restrictions. The UI is in Japanese because DESIGN-R® is a Japanese clinical standard and the target users are Japanese healthcare workers, but the app's functionality does not vary by region.

(日本語)
すべての地域で同じ機能を提供しており、地域固有の機能・コンテンツ・制限はありません。DESIGN-R®が日本の臨床標準であり、対象ユーザーが日本の医療従事者であるためUIは日本語ですが、機能自体は地域によって変わりません。

## 5. 規制業界・保護対象コンテンツについて

JOKUSO+ is not a regulated medical device and does not provide diagnosis, treatment recommendations, or medical advice. It is a documentation and visualization tool: the nurse using the app makes their own clinical assessment according to the DESIGN-R® criteria, and the app simply records the selected values, computes the standard total score, and displays the trend over time. This is stated explicitly both in-app and in the Privacy Policy ("本アプリは医療機器ではなく、診断や治療を目的としたものではありません"). The app does not contain any third-party protected content, and does not require any credentials associated with a regulated industry.

(日本語)
JOKUSO+は規制対象の医療機器ではなく、診断・治療の推奨・医療アドバイスを提供するものではありません。あくまで、看護師自身がDESIGN-R®の基準に沿って行った評価を記録・可視化する補助ツールであり、この点はアプリ内・プライバシーポリシーの双方に明記しています。第三者の保護対象コンテンツは含まれておらず、規制業界向けの資格証明を求められる要素もありません。
