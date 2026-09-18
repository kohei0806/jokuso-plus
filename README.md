# JOKUSO+

訪問看護師・介護施設の看護師向け、褥瘡(じょくそう)の経過をDESIGN-R®︎に沿って記録・可視化するアプリ。

- 患者ごとにDESIGN-R®︎(D・E・S・I・G・N・P)の項目を選択して記録
- 合計点・コードの自動計算、経過グラフ表示
- 記録ごとに写真を最大4枚添付(自動圧縮)、経過写真ギャラリー
- スマホでの使用に配慮したUI(タップ領域拡大、ホーム画面追加対応)

## データについて

すべての記録データはブラウザ(またはアプリ)の IndexedDB に保存されます。サーバーへの送信は一切行いません。

## Web版をローカルで開く

```bash
python3 -m http.server 8000
```

`http://localhost:8000` を開く。

## Web版のデプロイ

静的な `index.html` 一枚のみで動作するため、GitHub Pages にそのままデプロイできます(公開URL: https://kohei0806.github.io/jokuso-plus/ )。

## iOSアプリ(Capacitor)

Web版と同じコードを [Capacitor](https://capacitorjs.com/) でラップし、ネイティブiOSアプリとしてビルドしています。

```bash
npm install
npx cap sync ios
npx cap open ios   # Xcodeで開く
```

Xcode上でシミュレータ/実機を選択して実行(▶)すれば動作確認できます。

### App Store リリース

`.github/workflows/ios-release.yml` により、GitHub Actions上でアーカイブ・App Store Connectへの自動アップロードが可能です。実行には以下のリポジトリSecretsが必要です。

- `ASC_API_KEY_P8`: App Store Connect APIキーの中身(.p8ファイルの内容)
- `ASC_API_KEY_ID`: 同キーのKey ID
- `ASC_API_ISSUER_ID`: Issuer ID
