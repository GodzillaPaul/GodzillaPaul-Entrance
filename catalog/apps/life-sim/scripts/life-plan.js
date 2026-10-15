(function(){
'use strict';
const labels={living:'每月生活費',house:'房貸／房租',car:'車子',wedding:'家庭開銷',children:'子女',parents:'孝養父母',emergency:'旅行',medical:'醫療／保險',retirement:'退休準備',other:'其他'};
const order=Object.keys(labels),fmt=n=>Math.round(Number(n)||0).toLocaleString('zh-TW'),yuan=w=>Math.round((Number(w)||0)*10000);
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const input=id=>document.getElementById(id)?.value||'';
const pct=(a,b)=>b>0?Math.max(0,Math.min(100,a/b*100)):0;
// 選項文字去掉 emoji 與重複的類別前綴（例如「✈️ 旅行｜小資自由行」→「小資自由行」）
const cleanChoice=s=>String(s||'').replace(/[\p{Extended_Pictographic}️]/gu,'').replace(/^[^｜]*｜/,'').trim();

function snapshot(){
    refreshAgeDerivedExpenses();
    const original=baselineExp||exp,originalProfile=baselineProfile||u;
    const ideal=summarizeExp(original),revised=summarizeExp(exp);
    const inc=getIncomeBreakdown();
    return {profile:{...u},originalProfile:{...originalProfile},ideal,revised,original:cloneExp(original),current:cloneExp(exp),income:inc.total,incomeParts:{work:inc.work,slash:inc.slash,invest:inc.invest},hasInvestAssumption:inc.principal>0,consensus:input('life-priority'),action:input('life-next-action')};
}
function gapInfo(need,income){const gap=Math.round(need-income);return gap>0?{cls:'lp-bad',text:'每月缺口',value:fmt(gap)}:gap<0?{cls:'lp-good',text:'每月可保留',value:fmt(-gap)}:{cls:'lp-good',text:'收支打平',value:'0'};}
function gapText(need,income){const g=gapInfo(need,income);return g.text+' '+g.value+' 元';}
function retirementData(profile,expenses){
    const r=expenses.retirement||{},monthly=r.targetMonthly||0,house=expenses.house;
    const payoffAge=house&&house.ownership==='buy'&&house.amount>0?(house.startAge??profile.age)+MORTGAGE_YEARS:null;
    return {retire:profile.retire,age:profile.age,workYears:profile.retire-profile.age,retiredYears:85-profile.retire,monthly:yuan(monthly),total:yuan(r.targetTotal||0),saving:yuan(r.amount||0),housing:yuan(r.housingMonthly||0),housingYears:r.housingYears||0,housingNote:r.housingNote||'',payoffAge,set:monthly>0};
}
const logo='<span class="lp-mark">GP</span>';
function pageHeader(title,n,total=3){return `<div class="lp-head"><div class="lp-brand">${logo}<span>GODZILLAPAUL<small>LIFE &amp; CASHFLOW PLANNING</small></span></div><div class="lp-pageno"><span>${escape(title)}</span><b>${String(n).padStart(2,'0')}</b><i>/ ${String(total).padStart(2,'0')}</i></div></div>`;}
function footer(name,doc='財務人生規劃書'){return `<div class="lp-footer"><span>${escape(name||'客戶')}｜${escape(doc)}</span><span>本文件依填寫條件試算，不構成任何保證</span><span>金額單位：新臺幣元</span></div>`;}
function stat(label,value,unit='元',note=''){return `<div class="lp-stat"><span>${escape(label)}</span><b>${value}<small>${unit}</small></b>${note?`<em>${escape(note)}</em>`:''}</div>`;}
function section(title,html,extra=''){return `<section class="lp-section ${extra}"><h2><span>${escape(title)}</span></h2>${html}</section>`;}

function versionCard(kind,title,need,income,ret){
    const g=gapInfo(need,income),cover=pct(income,need);
    return `<div class="lp-version lp-${kind}">
        <div class="lp-version-top"><span class="lp-tag">${title}</span><span class="lp-version-age">${ret.retire} 歲退休</span></div>
        <div class="lp-version-label">每月生活總需求</div>
        <strong>${fmt(need)}<small>元／月</small></strong>
        <div class="lp-cover"><div class="lp-cover-bar"><i style="width:${cover.toFixed(1)}%"></i></div><span>目前收入可支應 <b>${Math.round(cover)}%</b></span></div>
        <div class="lp-version-gap ${g.cls}"><span>${g.text}</span><b>${g.value}<small>元</small></b></div>
    </div>`;
}
function timeline(b){
    const start=b.age,end=85,span=Math.max(end-start,1),pos=a=>((a-start)/span*100).toFixed(2);
    const payoff=b.payoffAge&&b.payoffAge>start&&b.payoffAge<end?`<div class="lp-tl-mark lp-tl-payoff" style="left:${pos(b.payoffAge)}%"><i></i><span>房貸繳清 ${b.payoffAge} 歲</span></div>`:'';
    return `<div class="lp-timeline">
        <div class="lp-tl-bar"><div class="lp-tl-work" style="width:${pos(b.retire)}%"><span>準備期 ${b.workYears} 年</span></div><div class="lp-tl-rest"><span>退休生活 ${b.retiredYears} 年</span></div></div>
        <div class="lp-tl-axis"><div class="lp-tl-mark" style="left:0"><i></i><span>現在 ${start} 歲</span></div><div class="lp-tl-mark lp-tl-retire" style="left:${pos(b.retire)}%"><i></i><span>退休 ${b.retire} 歲</span></div>${payoff}<div class="lp-tl-mark lp-tl-end" style="left:100%"><i></i><span>${end} 歲</span></div></div>
    </div>`;
}
function incomeBlock(data){
    const p=data.incomeParts,total=data.income||0;
    const parts=[['work','工作收入',p.work],['slash','斜槓收入',p.slash],['invest','投資收入',p.invest]];
    const bar=parts.filter(x=>x[2]>0).map(([k,,v])=>`<i class="lp-inc-${k}" style="width:${pct(v,total).toFixed(2)}%"></i>`).join('');
    return `<div class="lp-income"><div class="lp-income-bar">${bar}</div><div class="lp-income-legend">${parts.map(([k,l,v])=>`<div><i class="lp-inc-${k}"></i><span>${l}</span><b>${fmt(v)}</b><em>${Math.round(pct(v,total))}%</em></div>`).join('')}<div class="lp-income-total"><span>每月總收入</span><b>${fmt(total)}<small>元</small></b></div></div></div>${data.hasInvestAssumption?'<p class="lp-note">投資收入含本金年化 7% 的試算假設，非保證收入。</p>':''}`;
}

function build(data=snapshot()){
    const a=retirementData(data.originalProfile,data.original),b=retirementData(data.profile,data.current);
    const need=yuan(data.revised.total),idealNeed=yuan(data.ideal.total),diff=need-idealNeed;
    const date=new Date().toLocaleDateString('zh-TW',{year:'numeric',month:'2-digit',day:'2-digit'});
    const name=data.profile.nickname||'客戶';
    const gi=gapInfo(idealNeed,data.income),gr=gapInfo(need,data.income);
    const insight=diff<0
        ? `修正後每月需求減少 <b>${fmt(-diff)}</b> 元，${gi.cls==='lp-bad'?`每月缺口由 ${gi.value} 元`:'收支狀況'}${gr.cls==='lp-bad'?`調整為 <b>${gr.value}</b> 元。`:`轉為每月可保留 <b>${gr.value}</b> 元。`}`
        : diff>0 ? `修正後每月需求增加 <b>${fmt(diff)}</b> 元，請確認收入是否足以支應。` : '修正前後的每月需求相同。';

    // ── 第 1 頁：規劃摘要 ──
    let html=`<article class="lp-page lp-cover-page">${pageHeader('規劃摘要',1)}
        <div class="lp-hero">
            <div class="lp-hero-kicker">理想生活 × 退休準備</div>
            <h1><span>${escape(name)}</span>的財務人生規劃書</h1>
            <div class="lp-hero-meta"><span>${data.profile.age} 歲｜${data.profile.gender==='F'?'女性':'男性'}</span><span>目前月收入 ${fmt(data.income)} 元</span><span>規劃日期 ${escape(date)}</span></div>
        </div>
        <div class="lp-compare">${versionCard('ideal','理想生活',idealNeed,data.income,a)}${versionCard('adjusted','修正後生活',need,data.income,b)}</div>
        <div class="lp-insight"><span class="lp-insight-icon">→</span><p>${insight}</p></div>`;
    html+=section('修正後退休準備',b.set?`${timeline(b)}<div class="lp-stats">${stat('退休後每月支出',fmt(b.monthly),'元',b.housing>0&&b.housingYears<b.retiredYears?`含房貸 ${fmt(b.housing)} 元，${b.housingNote}`:'')}${stat('退休總需求',fmt(b.total))}${stat('退休前每月準備',fmt(b.saving),'元',`準備 ${b.workYears} 年`)}</div><p class="lp-note">退休總需求＝（生活支出 × 退休年數 ＋ 居住支出 × 實際負擔年數）× 12；購屋房貸只計算到繳清為止。每月準備＝總需求 ÷ 準備年數 ÷ 12。</p>`:'<p class="lp-note">尚未設定退休生活支出。</p>');
    html+=section('收入來源',incomeBlock(data))+footer(name)+'</article>';

    // ── 第 2 頁：修正前後比較 ──
    const keys=order.filter(k=>(data.original[k]?.amount>0)||(data.current[k]?.amount>0));
    const max=Math.max(1,...keys.map(k=>Math.max(yuan(data.original[k]?.amount),yuan(data.current[k]?.amount))));
    const rows=keys.map(k=>{
        const o=yuan(data.original[k]?.amount),c=yuan(data.current[k]?.amount),d=c-o;
        return `<tr><th>${escape(labels[k])}</th><td class="lp-num lp-c-ideal">${fmt(o)}</td><td class="lp-num lp-c-adjusted">${fmt(c)}</td><td class="lp-num ${d>0?'lp-up':d<0?'lp-down':'lp-flat'}">${d>0?'+':d<0?'−':''}${fmt(Math.abs(d))}</td><td class="lp-bars"><i class="lp-b-ideal" style="width:${pct(o,max).toFixed(1)}%"></i><i class="lp-b-adjusted" style="width:${pct(c,max).toFixed(1)}%"></i></td></tr>`;
    }).join('');
    const retRow=(label,fa,fb)=>`<tr><th>${label}</th><td class="lp-num lp-c-ideal">${fa}</td><td class="lp-num lp-c-adjusted">${fb}</td></tr>`;
    const money=(x,v)=>x.set?fmt(v)+' 元':'未設定';
    html+=`<article class="lp-page ${keys.length>=8?'lp-dense':''}">${pageHeader('修正前後比較',2)}
        <div class="lp-page-title"><h1>生活版本比較</h1><p>同一份人生清單，理想版與修正版逐項對照；退休準備為退休前每月需存下的金額。</p></div>
        <div class="lp-mini-compare"><div class="lp-ideal"><span>理想生活</span><b>${fmt(idealNeed)}<small>元／月</small></b><em class="${gi.cls}">${gapText(idealNeed,data.income)}</em></div><div class="lp-adjusted"><span>修正後生活</span><b>${fmt(need)}<small>元／月</small></b><em class="${gr.cls}">${gapText(need,data.income)}</em></div></div>
        <table class="lp-table lp-items"><colgroup><col style="width:20%"><col style="width:16%"><col style="width:16%"><col style="width:15%"><col style="width:33%"></colgroup>
        <thead><tr><th>項目（每月）</th><th class="lp-num">理想生活</th><th class="lp-num">修正後</th><th class="lp-num">增減</th><th><span class="lp-key"><i class="lp-b-ideal"></i><b>理想</b><i class="lp-b-adjusted"></i><b>修正後</b></span></th></tr></thead>
        <tbody>${rows||'<tr><td colspan="5" class="lp-empty">尚未設定生活項目</td></tr>'}</tbody>
        <tfoot><tr><th>每月總需求</th><td class="lp-num lp-c-ideal">${fmt(idealNeed)}</td><td class="lp-num lp-c-adjusted">${fmt(need)}</td><td class="lp-num ${diff>0?'lp-up':diff<0?'lp-down':'lp-flat'}">${diff>0?'+':diff<0?'−':''}${fmt(Math.abs(diff))}</td><td></td></tr></tfoot></table>`;
    html+=section('退休條件的影響',`<table class="lp-table lp-ret-table"><colgroup><col style="width:34%"><col style="width:33%"><col style="width:33%"></colgroup><thead><tr><th>條件</th><th class="lp-num">理想生活</th><th class="lp-num">修正後生活</th></tr></thead><tbody>
        ${retRow('退休年齡',a.retire+' 歲',b.retire+' 歲')}${retRow('準備年數／退休年數',`${a.workYears} 年／${a.retiredYears} 年`,`${b.workYears} 年／${b.retiredYears} 年`)}
        ${retRow('退休後每月支出',money(a,a.monthly),money(b,b.monthly))}${retRow('退休後居住支出',a.housing>0?`${fmt(a.housing)} 元・${a.housingYears} 年`:'無',b.housing>0?`${fmt(b.housing)} 元・${b.housingYears} 年`:'無')}
        ${retRow('退休總需求',money(a,a.total),money(b,b.total))}${retRow('退休前每月準備',money(a,a.saving),money(b,b.saving))}
        </tbody></table>`);
    html+=`<p class="lp-note">增減＝修正後 − 理想生活，負數代表每月支出減少。退休準備會隨退休年齡、退休後支出與房貸繳清時間重新計算。</p>`+footer(name)+'</article>';

    // ── 第 3 頁：討論紀錄 ──
    const detailKeys=order.filter(k=>data.current[k]?.amount>0||data.original[k]?.amount>0);
    const details=detailKeys.map(k=>{
        const c=data.current[k]||{},o=data.original[k]||{},kept=c.amount>0;
        const changed=o.amount>0&&(yuan(o.amount)!==yuan(c.amount)||cleanChoice(o.choice)!==cleanChoice(c.choice));
        const before=changed?`<div class="lp-choice-before">理想版：${escape(cleanChoice(o.choice)||labels[k])}・${fmt(yuan(o.amount))} 元</div>`:'';
        return `<div class="lp-choice ${kept?'':'lp-choice-off'}"><div class="lp-choice-top"><h3>${escape(labels[k])}</h3><b>${kept?fmt(yuan(c.amount))+'<small>元／月</small>':'已取消'}</b></div>${kept?(cleanChoice(c.choice)?`<p>${escape(cleanChoice(c.choice))}</p>`:''):'<p>修正版不保留此項目</p>'}${kept&&c.label?`<small>${escape(c.label)}</small>`:''}${before}</div>`;
    }).join('');
    const note=(v)=>v?`<p>${escape(v)}</p>`:'<div class="lp-lines"><i></i><i></i></div>';
    html+=`<article class="lp-page ${detailKeys.length>=7?'lp-dense':''}">${pageHeader('討論紀錄',3)}
        <div class="lp-page-title"><h1>生活選擇與共識</h1><p>以修正後版本為準；有調整的項目同時列出理想版選擇，方便下次回顧。</p></div>
        <div class="lp-choices">${details||'<p class="lp-note">尚未設定生活項目。</p>'}</div>
        <div class="lp-discussion"><div><h2>本次共識</h2>${note(data.consensus)}</div><div><h2>下一步</h2>${note(data.action)}</div></div>
        <div class="lp-sign"><div><span>顧問簽名</span><i></i></div><div><span>客戶確認</span><i></i></div><div><span>日期</span><i></i></div></div>
        <p class="lp-note">本計畫依所填條件試算，不代表退休可行性的保證。生活支出、收入與退休條件改變時，應重新評估。</p>${footer(name)}</article>`;
    return html;
}
// 等版面重排完成；分頁在背景時 requestAnimationFrame 會暫停，用計時器保底避免匯出卡住
const nextPaint=()=>Promise.race([new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))),new Promise(r=>setTimeout(r,120))]);
// Google Fonts 的中文字型依 unicode-range 分片下載；報告用到但頁面沒用過的字（多為全形標點）要先載入，否則 html2canvas 會畫成錯位的點
async function loadReportFonts(root){
    const text=root.textContent;
    try{await Promise.all(['400','500','700','800','900'].map(w=>document.fonts.load(`${w} 16px "Noto Sans TC"`,text)));}catch(e){}
    await document.fonts.ready;
}
function prepare(html=build()){let root=document.getElementById('life-plan-root');if(!root){root=document.createElement('div');root.id='life-plan-root';document.body.appendChild(root);}root.innerHTML=html;return root;}
// 共用：把多頁 .lp-page HTML 逐頁擷取成 A4 直式 PDF
async function exportPages(html,filename,button){
    const labelEl=button?.querySelector('span[id$="-label"]')||button;
    const label=labelEl?.textContent;let root;const savedZoom=document.body.style.zoom,savedTransform=document.body.style.transform;
    try{
        if(!window.html2canvas||!window.jspdf?.jsPDF)throw Error('PDF 元件尚未載入，請重新整理頁面');
        if(button){button.disabled=true;labelEl.textContent='正在製作 PDF…';}
        document.body.style.zoom='1';document.body.style.transform='none';root=prepare(html);root.classList.add('lp-exporting');
        await loadReportFonts(root);
        const pdf=new window.jspdf.jsPDF({orientation:'portrait',unit:'mm',format:'a4',compress:true});
        const pages=Array.from(root.querySelectorAll('.lp-page'));
        for(let i=0;i<pages.length;i++){
            root.replaceChildren(pages[i]);
            await nextPaint();
            if(pages[i].scrollHeight>pages[i].clientHeight+2)throw Error('內容超出頁面，請精簡文字後再匯出');
            const canvas=await window.html2canvas(pages[i],{scale:2,backgroundColor:'#fff',logging:false,useCORS:true,windowWidth:1200,scrollX:0,scrollY:0,onclone:doc=>{doc.documentElement.style.zoom='1';doc.body.style.zoom='1';doc.body.style.transform='none';const clone=doc.getElementById('life-plan-root');if(clone){Object.assign(clone.style,{position:'absolute',left:'0',top:'0',maxHeight:'none',overflow:'visible',transform:'none',zoom:'1'});}}});
            if(i)pdf.addPage();pdf.addImage(canvas.toDataURL('image/png'),'PNG',0,0,210,297,undefined,'FAST');
        }
        pdf.save(String(filename).replace(/[\\/:*?"<>|]/g,''));
        return pdf;
    }catch(error){console.error(error);alert('PDF 製作失敗：'+error.message);}finally{document.body.style.zoom=savedZoom;document.body.style.transform=savedTransform;root?.remove();if(button){button.disabled=false;labelEl.textContent=label;}}
}
function exportPDF(button){
    if(!baselineExp||!validRetirementAge(u.retire))return alert('請先完成生活模擬與有效的退休年齡設定。');
    return exportPages(build(),'財務人生規劃書_'+(u.nickname||'客戶')+'.pdf',button);
}
window.GPLifePlan={snapshot,build,prepare,exportPDF,exportPages,loadReportFonts,kit:{fmt,yuan,escape,pct,pageHeader,footer,stat,section}};
})();
