import {fields, markdown, validation} from './record.mjs';

const byId = id => document.getElementById(id);
const form = byId('record-form');
const controls = Object.fromEntries([...fields,'decision'].map(id=>[id,byId(id)]));
const feedback = byId('feedback');
const read = () => Object.fromEntries(Object.entries(controls).map(([name,el])=>[name,el.value]));
const hasInput = () => fields.some(name=>controls[name].value.trim());
let savedSnapshot = JSON.stringify(read());
const warnBeforeLeave = event => {event.preventDefault();event.returnValue='';};
const syncLeaveWarning = () => {
  window.removeEventListener('beforeunload',warnBeforeLeave);
  if (hasInput() && JSON.stringify(read()) !== savedSnapshot) window.addEventListener('beforeunload',warnBeforeLeave);
};
const markSaved = data => {savedSnapshot=JSON.stringify(data);syncLeaveWarning();};
const refresh = () => {
  const data = read();
  byId('preview').value = markdown(data);
  const error = validation(data);
  byId('validation').textContent = error;
  byId('download').disabled = byId('copy').disabled = Boolean(error);
  syncLeaveWarning();
};
const decisionInputs = new Set(['original','proposal','current','numbers','names','conditions','other']);
const reconsider = () => {
  if (controls.decision.value === 'pending') return false;
  controls.decision.value = 'pending';
  feedback.textContent = '文面や照合内容を変更したため、判断を保留に戻しました。確認後に選び直してください。';
  return true;
};
form.addEventListener('submit',event=>event.preventDefault());
form.addEventListener('input',event=>{
  feedback.textContent = '';
  if (byId('sample-status').textContent) byId('sample-status').textContent='架空の記入例から編集した内容です。保存前に各欄を確認してください。';
  if (decisionInputs.has(event.target.id)) reconsider();
  refresh();
});
form.addEventListener('change',refresh);

for (const [id,name] of [['use-original','original'],['use-proposal','proposal']]) {
  byId(id).addEventListener('click',()=>{
    const next=controls[name].value;
    if (!next.trim()) {feedback.textContent='先に'+(name==='original'?'元の文章':'AIの修正候補')+'を入力してください。';return;}
    if (controls.current.value && controls.current.value!==next && !window.confirm('現在使う文章の欄を置き換えます。よろしいですか？')) return;
    if (controls.current.value!==next) {controls.current.value=next;reconsider();}
    refresh();controls.current.focus();
  });
}

const example = {
  subject:'説明会の申込案内（架空）',purpose:'提出先と締切を一文で読めるようにする',
  original:'申込書を受付に提出してください。締切は11月28日です。',originalRef:'案内文 v1（架空）',
  proposal:'申込書は11月28日までに受付へ提出してください。',proposalRef:'案内文 修正候補A（架空）',
  changes:'二文を一文にまとめ、「締切は11月28日」を「11月28日までに」とした',
  changeReason:'期限と提出先を同じ文で確認できるようにする',numbers:'11月28日を維持',names:'該当なし',
  conditions:'受付へ提出する条件を維持',other:'申込書を提出する対象を維持',decision:'adopt',
  current:'申込書は11月28日までに受付へ提出してください。',currentRef:'案内文 v2（架空）',
  reason:'期限、提出先、提出対象が元の案内と一致している',remaining:'なし（架空の記入例）'
};
byId('example').addEventListener('click',()=>{
  if (hasInput() && !window.confirm('入力内容を架空の記入例に置き換えます。よろしいですか？')) return;
  for (const [name,el] of Object.entries(controls)) el.value=example[name] || '';
  byId('sample-status').textContent='架空の記入例を表示しています。実在の文書やAI出力ではありません。';
  feedback.textContent='架空の記入例を入れました。';refresh();
});
byId('clear').addEventListener('click',()=>{
  if (hasInput() && !window.confirm('入力内容を消します。保存が必要な記録は先にダウンロードしてください。消してよろしいですか？')) return;
  form.reset();byId('sample-status').textContent='';feedback.textContent='入力を消しました。';refresh();controls.original.focus();
});
byId('copy').addEventListener('click',async()=>{
  const data=read();if(validation(data)) {refresh();return;}
  const record=markdown(data);
  try {
    if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
    await navigator.clipboard.writeText(record);markSaved(data);feedback.textContent='記録をコピーしました。';
  } catch {
    const preview=byId('preview');preview.closest('details').open=true;preview.focus();preview.select();
    feedback.textContent='自動コピーが使えません。選択された記録を手動でコピーするか、ファイルを保存してください。';
  }
});
byId('download').addEventListener('click',()=>{
  const data=read();if(validation(data)) {refresh();return;}
  const url=URL.createObjectURL(new Blob([markdown(data)],{type:'text/markdown;charset=utf-8'}));
  const link=document.createElement('a');link.href=url;link.download='adopted-version-record.md';
  document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  markSaved(data);
  feedback.textContent='保存用ファイルを作りました。端末のダウンロード先を確認してください。';
});
for (const id of ['example','clear','use-original','use-proposal']) byId(id).disabled=false;
refresh();
