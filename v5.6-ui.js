(() => {
  const A=window.APP,L=window.LIFE;
  L.VERSION='V5.6';
  const esc=s=>String(s||'').replace(/'/g,'’').replace(/\n/g,' ');

  const ledger=A=>A?.p?.financeHistory?.[0]||A?._yearFinance||null;
  A.financeDetail=l=>{
    if(!l)return'本年尚未结算财富账本。';
    if(!l.items?.length)return l.note||'本年没有个人固定现金流。';
    const rows=l.items.map(x=>`${x.label} ${x.amount>0?'+':''}${L.fmtMoney(x.amount)}${x.note?`（${x.note}）`:''}`);
    return `第 ${l.age} 岁年度账本：${rows.join('；')}。固定现金流净额 ${l.net>0?'+':''}${L.fmtMoney(l.net)}。`;
  };

  A.financeStrip=()=>{
    const l=ledger(A);
    if(!l)return `<button class="v56-finance-strip empty" onclick="__tip('财富不会再后台随机跳动。工资、生活成本、住房、医疗、负债、投资和经营都会逐项记账。')"><b>💰 财富账本</b><span>每一笔变化都会说明来源</span></button>`;
    const items=(l.items||[]).slice(0,4).map(x=>`<i class="${x.amount>0?'up':'down'}">${x.label} ${x.amount>0?'+':''}${L.fmtMoney(x.amount)}</i>`).join('');
    return `<button class="v56-finance-strip" onclick="__tip('${esc(A.financeDetail(l))}')"><b>💰 ${l.age} 岁账本 <em class="${l.net>0?'up':l.net<0?'down':''}">${l.net>0?'+':''}${L.fmtMoney(l.net)}</em></b><span>${items||l.note||'无固定现金流'}</span><u>点开看明细</u></button>`;
  };

  const hudBase=A.gameHud;
  A.gameHud=()=>`<div class="v56-hudpack">${hudBase()}${A.financeStrip()}</div>`;

  A.financeHistoryView=()=>{
    const rows=(A.p?.financeHistory||[]).slice(0,16);
    if(!rows.length)return `<div class="v56-ledger-empty">还没有年度财富账本。18 岁后开始记录个人现金流。</div>`;
    return `<div class="v56-ledger-list">${rows.map(l=>`<article>
      <div><b>${l.age} 岁</b><strong class="${l.net>0?'up':l.net<0?'down':''}">${l.net>0?'+':''}${L.fmtMoney(l.net)}</strong><span>${L.fmtMoney(l.opening)} → ${L.fmtMoney(l.closing)}</span></div>
      <p>${(l.items||[]).map(x=>`${x.label} ${x.amount>0?'+':''}${L.fmtMoney(x.amount)}`).join(' · ')||l.note||'无固定现金流'}</p>
    </article>`).join('')}</div>`;
  };

  const infoBase=A.infoView;
  A.infoView=()=>{
    const html=infoBase();
    const block=`<div class="info-block v56-finance-history"><div class="section-line"><strong>💰 财富账本</strong><span>最近 ${(A.p?.financeHistory||[]).length?Math.min(16,A.p.financeHistory.length):0} 年</span></div>${A.financeHistoryView()}</div>`;
    return html.replace('<div class="info-block v54-history-block">',`${block}<div class="info-block v54-history-block">`);
  };
})();