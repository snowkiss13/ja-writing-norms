# ja-writing-norms

AI支援で書く日本語を、完成後の化粧直しではなく、下書き前の規範から読みやすくする2本のオープンスキルです。

[English](README.en.md)

日本語の概要と実例は[ドキュメントサイト](https://snowkiss13.github.io/ja-writing-norms/)から読めます。

[採用版を記録する無料ツール](https://snowkiss13.github.io/ja-writing-norms/adopted-version/)では、原文とAIの修正候補を並べ、現在使う文章と判断理由をMarkdownで保存できます。
入力内容はブラウザー内で処理し、サーバー送信や自動保存はしません。

無料ツールの画面にある「オフラインで使うHTML版を保存」からファイルをダウンロードし、パソコンのブラウザーで開いて使うこともできます。
記入とMarkdownの保存にはインターネット接続が不要です。
入力内容の自動保存はないため、閉じる前に記録を保存してください。
商品紹介やサイトへのリンクを開く際は、インターネットに接続します。

## 30秒でわかる違い

### Before

このAPIを使用すると、画像を複数のサイズに変換できます。
PNG、JPEG、WebPに対応しており、幅と高さを指定できます。
URLにパラメータを追加するだけで利用できるため、簡単に導入できます。
同じ条件で再度リクエストした場合はキャッシュを利用し、元画像より大きい幅は生成しません。

### After

一覧では幅320px、詳細画面では1280px。
同じ元画像を使うだけなのに、表示先が増えるたび変換処理も増えていく。

画像変換APIは、その分岐をURLのパラメータに移す。
元画像のURLに`width`と`format`を加えると、必要な寸法と形式の画像を返し、同じ指定への二度目以降のリクエストにはキャッシュを使う。

ただし、元画像より大きい幅は生成しない。
意図しない拡大を避けたい実装では、この制約が最初の確認点になる。

事実は増やしていません。
導入の順序、段落の役割、文の拍を変えると、仕様の意味が見えるようになります。
詳しい解説は[実例1](examples/01-api-documentation-introduction.md)にあります。

## 書いた後に隠すのではなく、書く前に決める

「AIっぽさ除去」を目的とする後処理型のツールは、完成した文の語尾や言い回しを置き換えます。
このリポジトリが扱うのは、その一段前です。

どの順序で根拠を置くか。
一段落に何を担わせるか。
どこで読者を止め、どの問いを先へ運ぶか。
文章を生成する前にこの判断基準を与え、推敲でも同じ基準を使います。

生成元を隠すことや、検出器の判定を変えることは目的にしません。
正確で、追いやすく、最後まで読める日本語を作るための規範です。

## 2つのスキル

| スキル | 役割 | 主な規範 |
|---|---|---|
| [`japanese-tech-writing`](skills/japanese-tech-writing/SKILL.md) | 正確さ | 段落と論証、因果と不確実性、読み手の負荷、視点、冗長、見出し |
| [`cognitive-rhythm-writing`](skills/cognitive-rhythm-writing/SKILL.md) | 読ませる力 | 文の拍、密度の波、冒頭、節の入り方、列挙の着地、問いの回収 |

2本は代替関係ではありません。
技術文書の規範で主張の骨格を固め、認知リズムの規範で読者がその骨格をたどれるようにします。
どちらの`SKILL.md`から使い始めても、もう一方を読むよう相互参照しています。

## 導入

### Skills CLIでプロジェクトに導入する

Node.js 22.20以降がある場合は、利用するプロジェクトのルートで次を実行すると、Codex用の2本をまとめて導入できます。

```bash
npx skills@1.7.4 add snowkiss13/ja-writing-norms --skill japanese-tech-writing cognitive-rhythm-writing --agent codex --copy
```

この方法では、`main`の最新版をプロジェクト内の`.agents/skills/`へコピーします。
2本は互いを参照するため、両方を指定しています。
使い始めるときは、Codexで`$japanese-tech-writing`または`$cognitive-rhythm-writing`を指定します。
CLIの対応環境と指定方法は[Skills CLIの公式ドキュメント](https://github.com/vercel-labs/skills/blob/main/docs/commands.md)で確認できます。

### タグを固定して手動で導入する

安定版の内容を固定して取得する場合は、タグを指定してチェックアウトします。

```bash
git clone --depth 1 --branch v0.3.1 https://github.com/snowkiss13/ja-writing-norms.git
cd ja-writing-norms
```

Gitを使わない場合は、[v0.3.1のZIPをダウンロード](https://github.com/snowkiss13/ja-writing-norms/archive/refs/tags/v0.3.1.zip)して展開できます。作成された`ja-writing-norms-0.3.1`フォルダへ移動してから、下の利用ツールに合う配置手順を実行してください。

その後、利用するツールの配置手順を実行してください。

### Claude Code

個人用スキルとして使う場合は、リポジトリのルートで次を実行します。

```bash
mkdir -p ~/.claude/skills
cp -R skills/japanese-tech-writing ~/.claude/skills/
cp -R skills/cognitive-rhythm-writing ~/.claude/skills/
```

プロジェクトだけに適用する場合は、対象プロジェクトの`.claude/skills/`へ2つのディレクトリをコピーします。
必要な場面で`/japanese-tech-writing`と`/cognitive-rhythm-writing`を呼び出してください。
詳しい配置規則は[Claude Codeの公式ドキュメント](https://code.claude.com/docs/en/skills)で確認できます。

### Codex

個人用スキルとして使う場合は、リポジトリのルートで次を実行します。

```bash
mkdir -p ~/.agents/skills
cp -R skills/japanese-tech-writing ~/.agents/skills/
cp -R skills/cognitive-rhythm-writing ~/.agents/skills/
```

プロジェクト単位なら、対象プロジェクトの`.agents/skills/`へコピーします。
Codex CLIまたはIDE拡張では、`$japanese-tech-writing`と`$cognitive-rhythm-writing`を明示して使えます。

常時適用したい場合は、このリポジトリの[`AGENTS.md`](AGENTS.md)を対象プロジェクトのルートへ置く方法もあります。
既存の`AGENTS.md`がある場合は上書きせず、内容を統合してください。
全文版は32KiBを超えるため、Codexで途中までしか読まれない場合は`~/.codex/config.toml`の`project_doc_max_bytes`を65536以上にします。
詳しくはOpenAI公式の[スキル](https://developers.openai.com/codex/skills/)と[`AGENTS.md`](https://developers.openai.com/codex/guides/agents-md/)の説明を参照してください。

### Cursor

[`AGENTS.md`](AGENTS.md)を対象プロジェクトのルートへ置きます。
既存ファイルがある場合は、このリポジトリの「適用手順」と2つの規範を既存内容へ統合してください。
Cursorはプロジェクトルートの`AGENTS.md`をルールとして読みます。
詳細は[Cursorの公式ドキュメント](https://docs.cursor.com/context/rules-for-ai#agents-md)にあります。

## 使い方

依頼文には、文章の目的、想定読者、確認済みの事実、不確実な点を添えます。
そのうえで2つの規範を併用するよう指定します。

```text
日本語技術文書の規範と認知リズムの規範を併用し、
次の事実だけを使ってAPIガイドの導入を書いてください。
未確認の内容は断定せず、冒頭で生じた問いを本文中で回収してください。
```

規範は事実を補いません。
入力に根拠がなければ、流暢な断定を足すのではなく、不確実性を残します。

## 実例

- [APIドキュメントの導入文](examples/01-api-documentation-introduction.md)
- [技術ブログの書き出し](examples/02-technical-blog-opening.md)
- [障害報告書](examples/03-incident-report-reasoning.md)
- [ライブラリ選定の比較記事](examples/04-library-comparison-landing.md)
- [チュートリアルの解説文](examples/05-tutorial-density-rhythm.md)
- [AI修正前後の比較と採用版の記録](examples/06-ai-revision-adopted-version.md)
- [AI修正後の採用版を記録する雛形](examples/07-adopted-version-record-template.md)
- [採用版の記録例](examples/08-adopted-version-record-example.md)
- [AI修正後の採用を見送る記録例](examples/09-adopted-version-rejection-example.md)
- [依頼文の変更点と維持条件の記入例](examples/10-request-handoff-conditions.md)（[空欄の記入シート](https://snowkiss13.github.io/ja-writing-norms/templates/request-handoff.txt)）

AI修正後の確認に使える[採用版チェックリストと指示文](https://note.com/smartcareviz/n/naf463e2cc4cb)も公開しています。500円の買い切りで、無料部分に指示文1本、有料部分にチェックリストと指示文4本を収録しています。

Beforeは、破綻した悪文ではなく、そのまま公開されても不思議ではない平坦な初稿です。
Afterで何を変えたかは、各ファイルの「効いた規範」に記録しています。

## 記入ツールの検証

記録の保存処理は、追加パッケージなしで `node --test tests/adopted-record.test.mjs` を実行して確認できます。
ローカルで画面を開く場合は `python3 -m http.server 8000 --bind 127.0.0.1 --directory docs` を実行し、`http://127.0.0.1:8000/adopted-version/` を開きます。
文面を変更すると判断が保留に戻ること、保存したファイルに入力内容が残ることを確認してください。

オフライン版は同じ画面とJavaScriptから生成します。
元のファイルを変更したら `python3 scripts/build_offline.py` で更新し、`python3 scripts/build_offline.py --check` と `python3 -m unittest discover -s tests -p 'test_offline_bundle.py'` で確認します。

## ライセンス

[MIT License](LICENSE)
