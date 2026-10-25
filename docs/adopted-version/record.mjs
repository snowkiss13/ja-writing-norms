export const fields = ['subject','workDate','purpose','original','originalRef','proposal','proposalRef','changes','changeReason','numbers','names','conditions','other','current','currentRef','reason','remaining'];
const decisions = {pending:'保留',adopt:'採用',reject:'見送り'};
const text = value => typeof value === 'string' ? value : '';
const present = value => text(value).trim().length > 0;

export function validation(data) {
  if (!Object.hasOwn(decisions, data.decision)) return '判断を選んでください。';
  if (!fields.some(name => present(data[name]))) return '原文や修正候補を入力してください。';
  if (data.decision !== 'pending' && ['original','proposal','current','reason'].some(name=>!present(data[name]))) {
    return '採用または見送りを記録するときは、原文、候補、現在使う文章、判断の理由を入力してください。';
  }
  return '';
}

export function block(value, empty = '未記入') {
  const body = present(value) ? text(value) : empty;
  let longest = 0;
  for (const run of body.matchAll(/`+/g)) longest = Math.max(longest, run[0].length);
  const fence = '`'.repeat(Math.max(3, longest + 1));
  return `${fence}text\n${body}\n${fence}`;
}

export function markdown(data) {
  if (!Object.hasOwn(decisions, data.decision)) throw new Error('Unknown decision');
  const section = (title, value, empty) => `## ${title}\n\n${block(value, empty)}\n`;
  const sections = [
    ['対象の文章',data.subject],['作業日',data.workDate],['修正の目的',data.purpose],
    ['元の文章',data.original],['元の文章の保存先または版',data.originalRef],
    ['AIの修正候補',data.proposal],['修正候補の保存先または版',data.proposalRef],
    ['変更した箇所',data.changes],['変更の理由',data.changeReason],
    ['照合した数字',data.numbers,'未確認（未記入）'],['照合した固有名詞',data.names,'未確認（未記入）'],
    ['照合した条件',data.conditions,'未確認（未記入）'],['その他の照合',data.other,'未確認（未記入）'],
    ['修正候補についての判断',decisions[data.decision]],['現在使う文章',data.current],
    ['現在使う版の保存先または版',data.currentRef],['判断の理由',data.reason],['未確認の点',data.remaining]
  ];
  return '# AI修正後の採用版の記録\n\n'+sections.map(s=>section(...s)).join('\n')+'\nこの記録は入力内容の保存です。文面の正しさを自動判定したものではありません。\n';
}
