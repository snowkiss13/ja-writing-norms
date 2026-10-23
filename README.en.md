# ja-writing-norms

Two open skills for writing clear Japanese with AI assistance by shaping the draft before it is written, not cosmetically rewriting it afterward.

[日本語](README.md)

## See the difference in 30 seconds

The sample remains in Japanese because Japanese prose is the subject of the skills.

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

No facts were added.
The revision changes the order of introduction, the job of each paragraph, and the rhythm of the sentences so the meaning of the specification becomes visible.
See [example 1](examples/01-api-documentation-introduction.md) for the applied rules.

## A pre-writing standard, not an AI-text disguise

Post-processing tools that remove an “AI-like” surface usually replace endings or expressions in an already completed draft.
This repository works one layer earlier: it decides how evidence is ordered, what each paragraph must do, where the reader should pause, and which question should remain open.

The goal is not to hide how a text was produced or to change an AI detector score.
The goal is Japanese prose that is accurate, easy to follow, and worth reading through to the end.

## The two skills

| Skill | Responsibility | Main rules |
|---|---|---|
| [`japanese-tech-writing`](skills/japanese-tech-writing/SKILL.md) | Accuracy | Paragraph logic, causality, uncertainty, reader load, viewpoint, concision, headings |
| [`cognitive-rhythm-writing`](skills/cognitive-rhythm-writing/SKILL.md) | Readability and momentum | Sentence beats, density waves, openings, section entries, list landings, question closure |

They are complementary rather than interchangeable.
The technical-writing skill makes the argument sound; the cognitive-rhythm skill makes that argument possible to follow without flattening every paragraph into the same voice.
Each `SKILL.md` points to the other.

## Installation

### Download without Git

Download the [v0.2.0 ZIP archive](https://github.com/snowkiss13/ja-writing-norms/archive/refs/tags/v0.2.0.zip) and extract it. Open the `ja-writing-norms-0.2.0` folder, then run the installation commands below from that repository root.

### Claude Code

From the repository root, install both personal skills with:

```bash
mkdir -p ~/.claude/skills
cp -R skills/japanese-tech-writing ~/.claude/skills/
cp -R skills/cognitive-rhythm-writing ~/.claude/skills/
```

For project scope, copy both directories into `.claude/skills/` in the target project.
Invoke `/japanese-tech-writing` and `/cognitive-rhythm-writing` when needed.
See the [official Claude Code skills documentation](https://code.claude.com/docs/en/skills) for scope and discovery details.

### Codex

From the repository root, install both personal skills with:

```bash
mkdir -p ~/.agents/skills
cp -R skills/japanese-tech-writing ~/.agents/skills/
cp -R skills/cognitive-rhythm-writing ~/.agents/skills/
```

For repository scope, copy them into `.agents/skills/` in the target project.
In Codex CLI or the IDE extension, mention `$japanese-tech-writing` and `$cognitive-rhythm-writing` explicitly.

To apply the norms on every task, place [`AGENTS.md`](AGENTS.md) at the target project root.
Merge it with an existing file instead of overwriting project instructions.
The full file exceeds 32 KiB; if Codex truncates it, set `project_doc_max_bytes` to at least 65536 in `~/.codex/config.toml`.
See OpenAI's official documentation for [skills](https://developers.openai.com/codex/skills/) and [`AGENTS.md`](https://developers.openai.com/codex/guides/agents-md/).

### Cursor

Place [`AGENTS.md`](AGENTS.md) at the target project root.
If the project already has one, merge the application procedure and both norms into it rather than overwriting it.
Cursor reads a root-level `AGENTS.md` as project rules; see the [official Cursor documentation](https://docs.cursor.com/context/rules-for-ai#agents-md).

## Usage

Give the agent the document's purpose, intended readers, verified facts, and unresolved uncertainty.
Then ask it to apply both skills.

```text
Apply japanese-tech-writing and cognitive-rhythm-writing to draft a Japanese API guide.
Use only the supplied facts, preserve any uncertainty, and close every question opened in the introduction.
```

The skills do not invent missing evidence.
When the input does not support a claim, they preserve uncertainty instead of adding a fluent assertion.

## Examples

- [API documentation introduction](examples/01-api-documentation-introduction.md)
- [Technical blog opening](examples/02-technical-blog-opening.md)
- [Incident report reasoning](examples/03-incident-report-reasoning.md)
- [Library comparison with a landing](examples/04-library-comparison-landing.md)
- [Tutorial with density and rhythm](examples/05-tutorial-density-rhythm.md)

The Before passages are plausible first drafts, not contrived nonsense.
Each example names the exact rules that changed the After version.

## License

[MIT License](LICENSE)
