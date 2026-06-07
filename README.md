# aoi_33.github.io

佐々葵の個人ページ。GitHub Pages（静的ホスティング）で公開。

## ファイル構成

```
index.html        トップページ（マークアップのみ。CSS/JSは外部化済み）
admin.html        活動エントリ管理ツール（ブラウザで開くだけ・サーバ不要）
css/
  main.css        サイト独自のスタイル（旧 index.html のインライン<style>を分離）
  styles.css      Bootstrap Freelancer テーマ
js/
  scripts.js      ナビバー挙動・スクロールスパイ（テーマ付属）
  i18n.js         日本語 / 英語の切り替え（data-ja / data-en を入れ替え）
  activity.js     活動・受賞の描画ロジック（index と admin で共有）
  content.js      トップページ初期化（データ取得 → 活動/受賞/経歴を描画）
data/
  entries.json    活動・受賞エントリ（★ ここを編集すると活動セクションが変わる）
  history.json    経歴タイムライン
assets/           画像・ファビコン
```

## 活動セクションの編集方法

活動・受賞は **`data/entries.json` が唯一の情報源** です。日付の降順に自動ソートされ、
`type: "award"` のエントリは「受賞歴」セクションにも自動で表示されます。

### おすすめ：管理ツール（admin.html）を使う

コードやJSONを直接触らずに編集できます。

1. **`admin.html` をブラウザで開く**
   - 公開サイト上: `https://aoi-33.github.io/admin.html`
   - ローカル: リポジトリ直下で `python3 -m http.server` を実行し
     `http://localhost:8000/admin.html` を開く
   - （`file://` で直接開くと自動読込ができないため、その場合は「ファイルを選択」で
     `data/entries.json` を読み込む）
2. 現在のエントリが一覧表示される。**「新規エントリ」** で追加、各行の **鉛筆** で編集、
   **ゴミ箱** で削除。右側に本番と同じ見た目の **プレビュー** が出る。
3. 種別（blog / poster / article / award）を選ぶと、必要な入力欄が切り替わる。
4. 完成したら **「entries.json をダウンロード」**（または「JSONをコピー」）。
5. ダウンロードした `entries.json` で **`data/entries.json` を置き換えて commit & push**。
   → GitHub Pages に反映される。

### さらに楽に：GitHubに直接保存（任意）

admin.html の「4. GitHubに直接保存」を使うと、ダウンロード→置換→commit の手順を省いて
**ブラウザから直接コミット**できます（公開URL `https://aoi-33.github.io/admin.html` でも可）。

1. [Fine-grained PAT 発行ページ](https://github.com/settings/personal-access-tokens/new) で
   トークンを作成：
   - Repository access → **Only select repositories** → このリポジトリのみ
   - Permissions → Repository permissions → **Contents: Read and write**
2. admin.html の owner / repo / branch / path を確認（`.github.io` で開くと自動入力）。
3. トークンを貼り、**「GitHubに保存（コミット）」** を押すと `data/entries.json` が更新される。
4. 公開サイトへの反映は GitHub Pages のキャッシュ更新まで数分（最大10分程度）。

> セキュリティ：トークンは **このブラウザの localStorage のみ** に保存され、送信先は
> `api.github.com`（HTTPS）だけ。権限をこのリポジトリの Contents に絞れば、万一漏れても
> 被害はこのリポジトリのファイル編集に限定されます。共用PCでは「記憶する」を外すか
> 「トークン消去」を使ってください。保存後に「最新を取りたい」ときは
> **「GitHubから最新を読込」** を使う（公開サイト側はCDNキャッシュで一時的に古い可能性あり）。

> トークンを使いたくない場合は、上記の「ダウンロード → data/ を置換 → commit」でもOKです。

### JSON を直接編集する場合

`data/entries.json` は配列。各エントリの形式：

```jsonc
// 通常エントリ（blog / poster / article）
{
  "date": "2025-01-15",            // YYYY-MM-DD
  "type": "blog",                  // blog | poster | article | award
  "url": "https://example.org/x",  // 省略可。"#articleId" でモーダルを開く
  "title_ja": "タイトル（日本語）",
  "title_en": "Title (English)",
  "desc_ja": "説明（日本語）",
  "desc_en": "Description (English)"
}

// 受賞エントリ（type: "award"）— 受賞歴セクションにも自動表示
{
  "date": "2025-09-20",
  "type": "award",
  "url": "https://example.org/award",
  "prize_ja": "最優秀賞",  "prize_en": "Grand Prize",
  "event_ja": "○○コンテスト", "event_en": "XX Contest",
  "org_ja": "○○大学",       "org_en": "XX University",
  "desc_ja": "説明（日本語）", "desc_en": "Description (English)"
}
```

編集後は JSON として妥当か確認（末尾カンマ・引用符忘れに注意）。

## 経歴（Career）の編集

`data/history.json` を編集。`{ "date": "YYYY-MM", "label_ja", "label_en", "venue_ja", "venue_en" }`。
約6か月以内の項目は1つのドットに自動でまとめられます（卒業＋入学など）。

## ローカルで確認

```bash
python3 -m http.server 8000
# → http://localhost:8000/             サイト本体
# → http://localhost:8000/admin.html   管理ツール
```
