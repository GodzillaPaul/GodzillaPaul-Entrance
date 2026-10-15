/* ============================================================
   退休財務計畫書 PDF（A4 直式 2 頁）
   與「財務人生規劃書」共用版型與匯出流程（life-plan.js 的 GPLifePlan）
   資料來源：app.js 的 RS 狀態與 retCompute()
   ============================================================ */
(function(){
'use strict';
const docName='退休財務計畫書';

function build(){
    const {fmt,escape,pct,pageHeader,footer,stat,section}=GPLifePlan.kit;
    const D=retCompute(RS);
    const name=RS.clientName||'客戶';
    const date=new Date().toLocaleDateString('zh-TW',{year:'numeric',month:'2-digit',day:'2-digit'});
    const wan=n=>fmt(Math.round(n/10000));
    const selfMonthly=Math.round(D.selfMonthly),policyMonthly=Math.round(D.policyMonthly);
    const saving=selfMonthly-policyMonthly;
    const prepared=Math.round(D.preparedMonthly);
    const cover=pct(D.monthDist,D.netMonthlyExpense);

    // ── 人生時間軸：現在 → 退休 → 平均餘命 → 100 歲 ──
    const start=RS.currentAge,end=Math.max(100,RS.lifeExpectancy),span=Math.max(end-start,1),pos=a=>((a-start)/span*100).toFixed(2);
    const timeline=`<div class="lp-timeline rp-timeline">
        <div class="lp-tl-bar"><div class="lp-tl-work" style="width:${pos(RS.retirementAge)}%"><span>工作準備期 ${D.workYears} 年</span></div><div class="lp-tl-rest" style="flex:none;width:${(pos(RS.lifeExpectancy)-pos(RS.retirementAge)).toFixed(2)}%"><span>退休生活 ${D.retireYears} 年</span></div><div class="rp-tl-long"><span>長壽風險</span></div></div>
        <div class="lp-tl-axis"><div class="lp-tl-mark" style="left:0"><i></i><span>現在 ${start} 歲</span></div><div class="lp-tl-mark lp-tl-retire" style="left:${pos(RS.retirementAge)}%"><i></i><span>退休 ${RS.retirementAge} 歲</span></div><div class="lp-tl-mark lp-tl-payoff" style="left:${pos(RS.lifeExpectancy)}%"><i></i><span>平均餘命 ${RS.lifeExpectancy} 歲</span></div><div class="lp-tl-mark lp-tl-end" style="left:100%"><i></i><span>${end} 歲</span></div></div>
    </div>`;

    const plan=(kind,tag,title,rows,monthly,note)=>`<div class="rp-plan rp-${kind}">
        <div class="rp-plan-head"><span class="lp-tag">${tag}</span><h3>${title}</h3></div>
        <div class="rp-plan-rows">${rows.map(([k,v])=>`<div><span>${k}</span><b>${v}</b></div>`).join('')}</div>
        <div class="rp-plan-monthly"><span>每月需存</span><strong>${fmt(monthly)}<small>元</small></strong></div>
        <p>${note}</p>
    </div>`;
    const selfRows=[['退休總花費',`${wan(D.totalNeed)} 萬`]];
    if(D.selfNeed<D.totalNeed)selfRows.push(['扣除已準備後',`${wan(D.selfNeed)} 萬`]);
    selfRows.push(['每年需存',`${fmt(D.selfAnnual)} 元`]);
    const policyRows=[['月配息所需本金',`${wan(D.capDist)} 萬`],['每年存入',`${fmt(D.policyAnnual)} 元`]];
    const insight=saving>0
        ? `同樣的退休目標，月配息規劃每月少存 <b>${fmt(saving)}</b> 元（約少 ${Math.round(saving/Math.max(selfMonthly,1)*100)}%），而且本金保留、退休後持續配息，不怕活得比預期久。`
        : `目前條件下，兩種方式每月存款相近；月配息規劃的優勢在於本金保留、退休後持續配息。`;

    // ── 第 1 頁：退休缺口與兩種準備方式 ──
    let html=`<article class="lp-page">${pageHeader('退休缺口',1,2)}
        <div class="lp-hero">
            <div class="lp-hero-kicker">退休金準備 × 月配息現金流</div>
            <h1><span>${escape(name)}</span>的退休財務計畫書</h1>
            <div class="lp-hero-meta"><span>${RS.currentAge} 歲｜${RS.gender==='F'?'女性':'男性'}</span><span>預計 ${RS.retirementAge} 歲退休</span><span>規劃日期 ${escape(date)}</span></div>
        </div>
        <div class="rp-keys">
            ${stat('退休後每月花費',fmt(RS.monthlyExpense))}
            ${stat('已準備資產每月可提供',fmt(prepared),'元',RS.preparedAmount>0?`已準備 ${wan(RS.preparedAmount)} 萬，以 7% 換算`:'')}
            <div class="lp-stat rp-key-gap"><span>每月需要補足</span><b>${fmt(D.netMonthlyExpense)}<small>元</small></b><em>退休後每個月的現金流缺口</em></div>
        </div>`;
    html+=section('人生時間軸',timeline);
    html+=section('兩種準備退休金的方式',`<div class="rp-plans">
        ${plan('self','方案一','自己存，退休後花存款',selfRows,selfMonthly,`存款會隨時間用完；退休 ${D.retireYears} 年後，若活得更久就沒有現金流。`)}
        ${plan('policy','方案二','月配息保單，打造每月現金流',policyRows,policyMonthly,`以本金年化 7% 配息，每月領約 ${fmt(D.netMonthlyExpense)} 元，本金持續保留。`)}
    </div><div class="lp-insight rp-insight"><span class="lp-insight-icon">→</span><p>${insight}</p></div>`);
    html+=`<p class="lp-note">試算假設：退休花費為退休期間平均每月支出，含退休後仍需繳納的房貸；平均餘命 ${RS.lifeExpectancy} 歲；月配息以年化 7% 試算；未計通膨。<br>方案一的每年存款為簡單平均，未計投資報酬。</p>${footer(name,docName)}</article>`;

    // ── 第 2 頁：保單規劃明細 ──
    const rows=(D.opt||[]).filter((_,i)=>(i+1)%5===0||i===0||i===D.ri);
    const max=Math.max(1,...rows.map(r=>Math.max(r.av,r.cum)));
    const chart=`<div class="rp-chart">${rows.map(r=>`<div class="rp-col ${r.year===D.workYears+1?'rp-col-retire':''}"><div class="rp-bars"><i class="rp-bar-cum" style="height:${pct(r.cum,max).toFixed(1)}%"></i><i class="rp-bar-av" style="height:${pct(r.av,max).toFixed(1)}%"></i></div><span>${r.age} 歲</span></div>`).join('')}</div>
        <div class="rp-legend"><span><i class="rp-bar-cum"></i><b>累計投入</b></span><span><i class="rp-bar-av"></i><b>帳戶價值</b></span><em>帳戶價值以假設投報率 ${RS.assumedReturn}% 試算</em></div>`;
    const table=`<table class="lp-table rp-table"><colgroup><col style="width:10%"><col style="width:10%"><col style="width:20%"><col style="width:20%"><col style="width:20%"><col style="width:20%"></colgroup>
        <thead><tr><th>年度</th><th>年齡</th><th class="lp-num">累計投入</th><th class="lp-num">帳戶價值</th><th class="lp-num">解約金</th><th class="lp-num">身故保障</th></tr></thead>
        <tbody>${rows.map(r=>`<tr class="${r.year===D.workYears+1?'rp-retire-row':''}"><th>${r.year}</th><td>${r.age}</td><td class="lp-num">${fmt(r.cum)}</td><td class="lp-num lp-c-adjusted">${fmt(r.av)}</td><td class="lp-num rp-sv">${fmt(r.sv)}</td><td class="lp-num">${fmt(r.db)}</td></tr>`).join('')}</tbody></table>`;
    html+=`<article class="lp-page">${pageHeader('保單規劃明細',2,2)}
        <div class="lp-page-title"><h1>月配息保單規劃明細</h1><p>每月存入 ${fmt(policyMonthly)} 元、存到 ${RS.retirementAge} 歲，退休後以解約金每月配息。</p></div>
        <div class="rp-params">
            ${stat('年目標保費',fmt(D.annualTarget))}${stat('月超額保費',fmt(D.monthlyExtra))}${stat('壽險保額',fmt(D.saWan),'萬')}${stat('假設投報率',String(RS.assumedReturn),'%')}
        </div>`;
    html+=section('帳戶價值成長',chart);
    html+=section('逐年試算',table);
    html+=`<div class="rp-payout">
            <div><span>退休時預估解約金</span><b>${fmt(D.svR)}<small>元</small></b></div>
            <i>→</i>
            <div><span>每月配息（年化 7%）</span><b class="rp-payout-main">${fmt(D.monthDist)}<small>元</small></b></div>
            <div class="rp-payout-cover"><span>可支應每月缺口</span><b>${Math.round(cover)}%</b><div class="lp-cover-bar"><i style="width:${cover.toFixed(1)}%"></i></div></div>
        </div>
        <p class="lp-note">本計畫書僅供參考試算，實際保單利益以壽險公司正式建議書為準。假設投資報酬率不代表未來實際報酬，配息率非保證，投資型保單有投資風險。</p>
        <div class="lp-sign"><div><span>顧問簽名</span><i></i></div><div><span>客戶確認</span><i></i></div><div><span>日期</span><i></i></div></div>
        ${footer(name,docName)}</article>`;
    return html;
}
function exportPDF(button){
    return GPLifePlan.exportPages(build(),docName+'_'+(RS.clientName||'客戶')+'.pdf',button);
}
window.GPRetirementPlan={build,exportPDF};
})();
