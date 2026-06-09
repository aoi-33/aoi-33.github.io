# aoi_33.github.io

佐々葵の個人ページ。GitHub Pages（静的ホスティング）で公開。

## ファイル構成

```
index.html        トップページ（マークアップのみ。CSS/JSは外部化済み）
admin.html        コンテンツ管理ツール（活動／論文を切替えて編集。ブラウザで開くだけ・サーバ不要）
css/
  main.css        サイト独自のスタイル（旧 index.html のインライン<style>を分離）
  styles.css      Bootstrap Freelancer テーマ
js/
  scripts.js      ナビバー挙動・スクロールスパイ（テーマ付属）
  i18n.js         日本語 / 英語の切り替え（data-ja / data-en を入れ替え）
  activity.js     活動・受賞の描画ロジック（index と admin で共有）
  publications.js 論文リストの描画ロジック（index と admin で共有）
  products.js     プロダクト（カードグリッド）の描画ロジック（index と admin で共有）
  content.js      トップページ初期化（データ取得 → 活動/受賞/経歴/論文/プロダクトを描画）
data/
  entries.json      活動・受賞エントリ（★ 活動セクションの情報源）
  publications.json 論文リスト（★ 論文セクションの情報源）
  products.json     プロダクト（★ プロダクトセクションの情報源）
  history.json      経歴タイムライン
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

## 論文（Publications）の編集

論文は **`data/publications.json` が情報源** です。日付の降順に自動ソートされます。
admin.html を開き、上部の **「編集対象」を「論文」に切り替える** と、活動と同じ要領で
追加・編集・削除・プレビュー・ダウンロード・GitHub直接保存ができます。

タイトル・著者・掲載誌は **論文の言語のまま単一表記**（日英の二重入力は不要）。
見出しと種別バッジのみ日英で切り替わります。著者欄の自分の名前（`佐々葵` / `Aoi Sassa`）は
自動で太字になります（変更は `js/publications.js` の `SELF_NAMES`）。

```jsonc
{
  "date": "2026-03-01",          // YYYY-MM-DD（年だけ表示に使う）
  "type": "domestic",            // journal|international|domestic|poster|preprint|thesis
  "authors": "佐々葵, 河口信夫",  // 著者（自分の名前は自動で太字）
  "title": "論文タイトル",
  "venue": "情報処理学会 研究報告 …", // 掲載誌・会議名（省略可）
  "extra": "Vol.1, pp.1–8",      // 巻号・ページ等（省略可）
  "url": "https://doi.org/…"     // DOI / PDF（省略可。あればタイトルがリンクになる）
}
```

> 初期状態は「（サンプル）…」の1件が入っています。admin で本物に差し替えてください。

## プロダクト（Products）の編集

github.io などの公開プロジェクトを **カード**で並べるセクション。情報源は **`data/products.json`**。
admin.html の「編集対象」を **「プロダクト」** に切り替えると、活動・論文と同じ要領で編集できます。
説明は単一表記（日英切替なし）。日付は任意で、入れると新しい順、無ければ末尾に並びます。

```jsonc
{
  "name": "My Portfolio Site",       // 必須
  "desc": "短い説明",                 // 任意
  "url":  "https://aoi-33.github.io/",// 任意（Demoリンク／ライブサイト。タイトルのリンク先にもなる）
  "repo": "https://github.com/…",     // 任意（Codeリンク）
  "tags": "React, Go, Azure",         // 任意（カンマ区切り → タグchip）
  "date": "2026-05-01"                // 任意（並び順のみ。YYYY-MM-DD）
}
```

> カードは画像なしのテキスト主体デザイン（タイトル＋説明＋タグ＋Demo/Codeリンク）。
> タイトルは url（無ければ repo）へのリンクになります。

## 経歴（Career）の編集

`data/history.json` を編集。`{ "date": "YYYY-MM", "label_ja", "label_en", "venue_ja", "venue_en" }`。
約6か月以内の項目は1つのドットに自動でまとめられます（卒業＋入学など）。

## ローカルで確認

```bash
python3 -m http.server 8000
# → http://localhost:8000/             サイト本体
# → http://localhost:8000/admin.html   管理ツール
```
