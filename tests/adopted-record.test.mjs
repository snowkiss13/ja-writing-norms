import test from 'node:test';
import assert from 'node:assert/strict';
import {block, markdown, validation} from '../docs/adopted-version/record.mjs';

test('Japanese multiline text and whitespace survive an exported code block',()=>{
  const value='  原文。\n絵文字👩🏽‍💻と結合文字e\u0301\n末尾  \n';
  const lines=block(value).split('\n');
  assert.equal(lines.slice(1,-1).join('\n'),value);
});
test('raw HTML and Markdown delimiters stay inside a longer literal fence',()=>{
  const value='```\n<img src="https://example.invalid/track">\n``````\n# 偽の見出し';
  const output=block(value);const fence=output.split('\n')[0].slice(0,-4);
  assert.equal(fence.length,7);
  assert.equal(output,`${fence}text\n${value}\n${fence}`);
});
test('many separate backticks do not exceed the function argument limit',()=>{
  const value='` x '.repeat(160000);
  assert.equal(block(value),'```text\n'+value+'\n```');
});
test('blank checks stay unconfirmed rather than becoming verified',()=>{
  const output=markdown({decision:'pending',original:'原文'});
  assert.equal(output.split('未確認（未記入）').length-1,4);
  assert.match(output,/修正候補についての判断\n\n```text\n保留/);
  assert.match(output,/未確認の点\n\n```text\n未記入/);
});
test('a rejected proposal does not replace the separately chosen current text',()=>{
  const data={decision:'reject',original:'受付は17時まで。',proposal:'受付は18時まで。',current:'受付は17時まで。',reason:'変更の根拠が未確認'};
  assert.equal(validation(data),'');
  const output=markdown(data);
  assert.match(output,/判断\n\n```text\n見送り/);
  assert.match(output,/現在使う文章\n\n```text\n受付は17時まで。/);
  assert.match(output,/AIの修正候補\n\n```text\n受付は18時まで。/);
});
test('adoption and rejection need both inputs, a current version and a reason',()=>{
  const data={decision:'adopt',original:'原文',proposal:'候補',current:'選んだ文',reason:'確認理由'};
  assert.equal(validation(data),'');
  for(const decision of ['adopt','reject']) for(const name of ['original','proposal','current','reason']) {
    assert.notEqual(validation({...data,decision,[name]:' \n'}),'');
  }
  assert.equal(validation({decision:'pending',proposal:'確認待ちの候補'}),'');
  assert.notEqual(validation({decision:'pending'}),'');
});
test('invalid decisions never produce a claimed adoption',()=>{
  for(const decision of ['constructor','__proto__','APPROVED',undefined]) {
    assert.notEqual(validation({decision,original:'原文'}),'');
    assert.throws(()=>markdown({decision}));
  }
});
