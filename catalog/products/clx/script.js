// ── fullscreen icon swap ──
document.addEventListener('fullscreenchange',()=>{
  const inFS=!!document.fullscreenElement;
  document.getElementById('icon-fs-enter').style.display=inFS?'none':'';
  document.getElementById('icon-fs-exit').style.display=inFS?'':'none';
});

// ── ctrl-bar auto-hide ──
(function(){
  const bar=document.querySelector('.ctrl-bar');
  let t;
  function show(){bar.classList.remove('hidden');clearTimeout(t);t=setTimeout(()=>bar.classList.add('hidden'),5000);}
  document.addEventListener('mousemove',show);
  document.addEventListener('keydown',show);
  document.addEventListener('touchstart',show,{passive:true});
  bar.addEventListener('mouseenter',()=>{clearTimeout(t);bar.classList.remove('hidden');});
  bar.addEventListener('mouseleave',show);
  show();
})();

// ── lightbox ──
const lightbox=document.getElementById('lightbox');
const lightboxImg=document.getElementById('lightbox-img');
document.addEventListener('click',e=>{
  const img=e.target.closest('.slide img');
  if(!img||img.closest('.lightbox'))return;
  lightboxImg.src=img.src;lightbox.classList.add('active');e.stopPropagation();
});
lightbox.addEventListener('click',e=>{if(e.target!==lightboxImg)lightbox.classList.remove('active');});

// ── slide engine ──
let mode='slide',current=0;
const slides=document.querySelectorAll('.slide');
const counter=document.getElementById('counter');
slides.forEach(s=>s.setAttribute('data-orig-style',s.getAttribute('style')||''));

function resetAnims(s){
  s.querySelectorAll('.animate-line').forEach(el=>{el.style.animation='none';el.offsetHeight;el.style.animation='';});
}

function triggerActiveChart(){
  if(!window.Chart || !Chart.instances)return;
  const active=slides[current];
  if(!active)return;
  const canvases=[...active.querySelectorAll('canvas')];
  Object.values(Chart.instances).forEach(chart=>{
    if(canvases.includes(chart.canvas)){
      try{chart.reset(); chart.update();}catch(e){}
    }
  });
}
function enhanceTables(){
  document.querySelectorAll('.benefit-table,.comp-table,.cancer-cost-table,.nhi-table').forEach(table=>{
    if(table.parentElement && table.parentElement.classList.contains('table-scroll'))return;
    const wrap=document.createElement('div');
    wrap.className='table-scroll';
    table.parentNode.insertBefore(wrap,table);
    wrap.appendChild(table);
  });
}
enhanceTables();
function render(){
  if(mode==='slide'){
    slides.forEach((s,i)=>{
      s.style.position='absolute';s.style.inset='0';
      s.style.display=i===current?'flex':'none';
      if(i===current)resetAnims(s);
    });
  }else{
    slides.forEach(s=>{s.style.position='relative';s.style.display='flex';});
  }
  counter.textContent=(current+1)+' / '+slides.length;
  requestAnimationFrame(triggerActiveChart);
}
function next(){if(current<slides.length-1){current++;render();}}
function prev(){if(current>0){current--;render();}}
function toggleMode(){
  mode=mode==='slide'?'scroll':'slide';
  document.body.classList.toggle('scroll-mode');
  document.documentElement.classList.toggle('scroll-mode');
  render();
}
document.addEventListener('keydown',e=>{
  if(e.key==='ArrowRight'||e.key===' '){e.preventDefault();next();}
  if(e.key==='ArrowLeft'){e.preventDefault();prev();}
  if(e.key==='f'||e.key==='F'){document.documentElement.requestFullscreen?.();}
  if(e.key==='g'||e.key==='G'){toggleGrid();}
  if(e.key==='Escape'){
    if(document.body.classList.contains('grid-mode'))toggleGrid();
    else if(lightbox.classList.contains('active'))lightbox.classList.remove('active');
    else if(document.fullscreenElement)document.exitFullscreen();
  }
});
window.addEventListener('beforeprint',()=>slides.forEach(s=>{s.style.position='';s.style.inset='';s.style.display=''}));
window.addEventListener('afterprint',()=>render());

function toggleGrid(){
  const isGrid=document.body.classList.toggle('grid-mode');
  document.documentElement.classList.toggle('grid-mode');
  if(isGrid){
    requestAnimationFrame(()=>{
      const natW=window.innerWidth,natH=window.innerHeight;
      const thumbW=(slides[0]?.getBoundingClientRect().width)||360;
      const zoom=thumbW/natW;
      slides.forEach((s,i)=>{
        const orig=s.getAttribute('data-orig-style')||'';
        s.style.cssText=orig+`;width:${natW}px;height:${natH}px;zoom:${zoom};--grid-zoom:${zoom}`;
        s.setAttribute('data-slide-num',i+1);
        s.classList.toggle('grid-current',i===current);
        s._gc=()=>{current=i;toggleGrid();render();};
        s.addEventListener('click',s._gc);
      });
      requestAnimationFrame(()=>{
        const cur=document.querySelector('.slide.grid-current');
        if(cur)cur.scrollIntoView({block:'center',behavior:'instant'});
      });
    });
  }else{
    slides.forEach(s=>{
      s.style.cssText=s.getAttribute('data-orig-style')||'';
      if(s._gc){s.removeEventListener('click',s._gc);delete s._gc;}
      s.classList.remove('grid-current');
    });
    render();
  }
}
if(window.innerWidth<=768){
  mode='scroll';
  document.body.classList.add('scroll-mode');
  document.documentElement.classList.add('scroll-mode');
}
let tx=0,ty=0;
document.addEventListener('touchstart',e=>{tx=e.touches[0].clientX;ty=e.touches[0].clientY;},{passive:true});
document.addEventListener('touchend',e=>{
  if(mode!=='slide')return;
  const dx=e.changedTouches[0].clientX-tx,dy=e.changedTouches[0].clientY-ty;
  if(Math.abs(dx)<50||Math.abs(dy)>Math.abs(dx))return;
  if(dx<0)next();else prev();
});
render();

// ── Chart.js charts ──
const nhiFontSize=window.innerWidth>1200?13:10;
Chart.defaults.font.family="'Noto Sans TC',sans-serif";

// Slide 02: NHI重大傷病表格版，無圖表初始化

// Slide 03: 台灣人口
const popColors=['#5b9bd5','#5b9bd5','#5b9bd5','#5b9bd5','#30DAA2','#5b9bd5','#E03E57','#E03E57','#E03E57','#E03E57'];
new Chart(document.getElementById('chart-pop'),{
  type:'bar',
  data:{
    labels:['2016','2017','2018','2019','2020','2021','2022','2023','2024','2025'],
    datasets:[{
      label:'台灣人口數（萬人）',
      data:[2352,2357,2358,2360,2356,2338,2319,2317,2312,2305],
      backgroundColor:popColors,borderRadius:4,
    }]
  },
  options:{
    responsive:true,maintainAspectRatio:false,
    plugins:{legend:{display:false},tooltip:{callbacks:{label:ctx=>ctx.parsed.y.toLocaleString()+' 萬人'}}},
    scales:{
      y:{beginAtZero:false,min:2295,max:2370,ticks:{callback:v=>v+'萬',font:{size:nhiFontSize}},grid:{color:'rgba(0,0,0,0.05)'}},
      x:{ticks:{font:{size:nhiFontSize}}}
    },
    animation:{duration:900,easing:'easeOutQuart'}
  },
  plugins:[{
    afterDatasetsDraw(chart){
      const ctx=chart.ctx;
      chart.data.datasets.forEach((ds,di)=>{
        chart.getDatasetMeta(di).data.forEach((bar,i)=>{
          ctx.save();ctx.fillStyle='#444';ctx.font=`bold ${nhiFontSize}px 'Noto Sans TC'`;
          ctx.textAlign='center';
          ctx.fillText(ds.data[i].toLocaleString(),bar.x,bar.y-5);
          ctx.restore();
        });
      });
    }
  }]
});

// Slide 04: 男女人口
new Chart(document.getElementById('chart-gender'),{
  type:'bar',
  data:{
    labels:['2016','2017','2018','2019','2020','2021','2022','2023','2024','2025'],
    datasets:[
      {label:'男性人口數',data:[1174,1177,1178,1180,1178,1170,1160,1158,1155,1150],backgroundColor:'rgba(91,155,213,0.85)',borderRadius:3},
      {label:'女性人口數',data:[1178,1180,1180,1180,1178,1168,1159,1159,1157,1155],backgroundColor:'rgba(244,164,96,0.85)',borderRadius:3}
    ]
  },
  options:{
    responsive:true,maintainAspectRatio:false,
    plugins:{
      legend:{position:'top',labels:{font:{size:nhiFontSize},padding:12}},
      tooltip:{callbacks:{label:ctx=>ctx.dataset.label+': '+ctx.parsed.y.toLocaleString()+' 萬人'}}
    },
    scales:{
      y:{beginAtZero:false,min:1140,max:1195,ticks:{callback:v=>v+'萬',font:{size:nhiFontSize}},grid:{color:'rgba(0,0,0,0.05)'}},
      x:{ticks:{font:{size:nhiFontSize}}}
    },
    animation:{duration:900,easing:'easeOutQuart'}
  },
  plugins:[{
    afterDatasetsDraw(chart){
      const ctx=chart.ctx;
      const fs=Math.max(10,nhiFontSize-1);
      chart.data.datasets.forEach((ds,di)=>{
        chart.getDatasetMeta(di).data.forEach((bar,i)=>{
          ctx.save();
          ctx.fillStyle=di===0?'#1a5276':'#7d4000';
          ctx.font=`bold ${fs}px 'Noto Sans TC'`;
          ctx.textAlign='center';
          ctx.fillText(ds.data[i].toLocaleString(),bar.x,bar.y-(di===0?10:22));
          ctx.restore();
        });
      });
    }
  }]
});

// Slide 05: 女性罹癌
const cancerColors=['#d889b8','#d889b8','#d889b8','#d889b8','#d889b8','#d889b8','#d889b8','#d889b8','#FF8933','#E03E57'];
new Chart(document.getElementById('chart-cancer'),{
  type:'bar',
  data:{
    labels:['2014','2015','2016','2017','2018','2019','2020','2021','2022','2023'],
    datasets:[{
      label:'女性罹癌人數',
      data:[46750,49021,51029,52443,54611,57801,59254,58522,63003,66807],
      backgroundColor:cancerColors,borderRadius:4,
    }]
  },
  options:{
    responsive:true,maintainAspectRatio:false,
    plugins:{legend:{display:false},tooltip:{callbacks:{label:ctx=>ctx.parsed.y.toLocaleString()+' 人'}}},
    scales:{
      y:{beginAtZero:false,min:40000,ticks:{callback:v=>v.toLocaleString(),font:{size:nhiFontSize}},grid:{color:'rgba(0,0,0,0.05)'}},
      x:{ticks:{font:{size:nhiFontSize}}}
    },
    animation:{duration:900,easing:'easeOutQuart'}
  },
  plugins:[{
    afterDatasetsDraw(chart){
      const ctx=chart.ctx;
      chart.data.datasets.forEach((ds,di)=>{
        chart.getDatasetMeta(di).data.forEach((bar,i)=>{
          ctx.save();ctx.fillStyle='#333';ctx.font=`bold ${nhiFontSize}px 'Noto Sans TC'`;
          ctx.textAlign='center';
          ctx.fillText(ds.data[i].toLocaleString(),bar.x,bar.y-5);
          ctx.restore();
        });
      });
    }
  }]
});

// Slide 07: 年齡罹癌圓餅 (donut)
new Chart(document.getElementById('chart-pie'),{
  type:'doughnut',
  data:{
    labels:['65歲以上（44%）','50–64歲（40%）','40–49歲（12%）','0–39歲（4%）'],
    datasets:[{
      data:[44,40,12,4],
      backgroundColor:['#8b1a2e','#c0394f','#e03e57','#f4a7b9'],
      borderWidth:2,borderColor:'#F0F6F9',
    }]
  },
  options:{
    responsive:true,maintainAspectRatio:false,
    cutout:'55%',
    plugins:{
      legend:{display:false},
      tooltip:{callbacks:{label:ctx=>ctx.label+': '+ctx.parsed+'%'}}
    },
    animation:{duration:900,easing:'easeOutQuart'}
  }
});

// ══ CLX Calculator – official rate table ══
const CLX_RATES = {
  10:{18:435,19:440,20:445,21:450,22:455,23:460,24:465,25:470,26:480,27:490,
      28:500,29:510,30:515,31:525,32:535,33:545,34:555,35:565,36:575,37:580,
      38:590,39:600,40:610,41:620,42:630,43:640,44:650,45:660,46:670,47:680,
      48:690,49:700,50:710,51:720,52:730,53:740,54:755,55:765,56:780,57:795,
      58:825,59:845,60:880},
  20:{18:230,19:235,20:240,21:245,22:250,23:255,24:260,25:265,26:270,27:275,
      28:280,29:285,30:290,31:295,32:300,33:310,34:315,35:325,36:330,37:335,
      38:345,39:350,40:355,41:365,42:370,43:380,44:390,45:400,46:410,47:420,
      48:435,49:450,50:470}
};

const CLZ_RATES = {
  10:{18:420,19:430,20:439,21:450,22:461,23:472,24:483,25:494,26:504,27:515,
      28:526,29:537,30:548,31:562,32:576,33:590,34:604,35:618,36:632,37:646,
      38:660,39:674,40:688,41:705,42:721,43:738,44:755,45:772,46:788,47:805,
      48:822,49:838,50:855,51:888,52:922,53:955,54:988,55:1022,56:1055,
      57:1088,58:1121,59:1155,60:1188},
  20:{18:222,19:228,20:233,21:239,22:246,23:252,24:258,25:265,26:271,27:277,
      28:283,29:290,30:296,31:306,32:315,33:325,34:334,35:344,36:354,37:363,
      38:373,39:382,40:392,41:412,42:433,43:453,44:473,45:494,46:514,47:534,
      48:554,49:575,50:595}
};

const CALC_PRODUCTS = {
  CLX:{
    chip:'CLX 官方費率・女性專屬', label:'女性特定癌症加碼', summary:'乳癌、子宮頸癌等女性11項',
    disease:'紅斑性狼瘡腎病變／類風濕關節炎，保額 10%', surgery:'尿失禁、骨盆底等女性 14 項，保額 2%',
    source:'＊依富邦人壽 CLX 官方費率表（女性），實際保費以核保結果為準。保險年齡：足歲餘數超過6個月加計1歲。投保年齡：10年繳18～60歲，20年繳18～50歲。',
    kicker:'CLX｜女性專屬',
    cancers:[['C43','皮膚惡性黑色素瘤'],['C44','皮膚之其他及未明示惡性腫瘤'],['C50','乳房惡性腫瘤'],['C51','外陰惡性腫瘤'],['C52','陰道惡性腫瘤'],['C53','子宮頸惡性腫瘤'],['C54','子宮體惡性腫瘤'],['C55','未明示部位子宮惡性腫瘤'],['C56','卵巢惡性腫瘤'],['C57','其他及未明示女性生殖器官惡性腫瘤'],['C58','胎盤惡性腫瘤']]
  },
  CLZ:{
    chip:'CLZ 官方費率・男性專屬', label:'男性特定癌症加碼', summary:'攝護腺、大腸等男性9項',
    disease:'主動脈手術／嚴重肝硬化，保額 10%，第 2 年起', surgery:'攝護腺等男性 8 項手術，保額 2%，限一次',
    source:'＊依富邦人壽 CLZ 官方費率表（男性），實際保費以核保結果為準。保險年齡：足歲餘數超過6個月加計1歲。投保年齡：10年繳18～60歲，20年繳18～50歲。',
    kicker:'CLZ｜男性專屬',
    cancers:[['C18','結腸惡性腫瘤'],['C19','直腸乙狀結腸連接處惡性腫瘤'],['C20','直腸惡性腫瘤'],['C21','肛門及肛門管惡性腫瘤'],['C60','陰莖惡性腫瘤'],['C61','攝護腺惡性腫瘤'],['C62','睪丸惡性腫瘤'],['C63','其他及未明示男性生殖器官惡性腫瘤'],['C67','膀胱惡性腫瘤']]
  }
};

const FREQ_FACTOR = {annual:1, semi:0.52, quarter:0.262, month:0.088};
const FREQ_LABEL  = {annual:'年繳', semi:'半年繳每期', quarter:'季繳每期', month:'月繳每期'};
const FREQ_TIMES  = {annual:1, semi:2, quarter:4, month:12};

const _cc = {product:'CLX', per:10, freq:'annual'};

function setCalcProduct(product){
  if(!CALC_PRODUCTS[product]) return;
  _cc.product = product;
  const data = CALC_PRODUCTS[product];
  document.querySelectorAll('.cc-product-btn').forEach(btn => {
    const active = btn.dataset.product === product;
    btn.classList.toggle('on', active);
    btn.setAttribute('aria-pressed', String(active));
  });
  const setText = (id, value) => { const el = document.getElementById(id); if(el) el.textContent = value; };
  setText('cc-product-chip', data.chip);
  setText('cc-specific-prefix', product === 'CLX' ? '女性特定癌症最高：' : '男性特定癌症最高：');
  setText('cc-specific-label', data.label);
  setText('cc-disease-note', data.disease);
  setText('cc-surgery-note', data.surgery);
  setText('cc-source-note', data.source);
  const specificNote = document.getElementById('cc-specific-note');
  if(specificNote) specificNote.innerHTML = `${data.summary}，第6年起最高 <span id="b-specific-total" style="color:#d43050;font-weight:900;">—</span> 萬`;
  const payWrap = document.getElementById('cc-pay-discount-wrap');
  if(payWrap) payWrap.style.display = product === 'CLX' ? '' : 'none';
  const listBtn = document.querySelector('.cc-cancer-list-btn');
  if(listBtn) listBtn.textContent = `查看完整 ${data.cancers.length} 項`;
  closeCancerList();
  clzCalc();
}

function openCancerList(){
  const data = CALC_PRODUCTS[_cc.product];
  const modal = document.getElementById('cc-cancer-modal');
  const grid = document.getElementById('cc-cancer-grid');
  if(!modal || !grid) return;
  document.getElementById('cc-cancer-kicker').textContent = data.kicker;
  document.getElementById('cc-cancer-title').textContent = `多 50% 的 ${data.cancers.length} 項特定癌症`;
  grid.replaceChildren(...data.cancers.map(([code,name]) => {
    const item = document.createElement('div');
    item.className = 'cc-cancer-item';
    const badge = document.createElement('b'); badge.textContent = code;
    const label = document.createElement('span'); label.textContent = name;
    item.append(badge,label);
    return item;
  }));
  modal.hidden = false;
  modal.querySelector('.cc-cancer-close')?.focus();
}

function closeCancerList(){
  const modal = document.getElementById('cc-cancer-modal');
  if(modal) modal.hidden = true;
}

function clzSet(key, val, btn){
  _cc[key] = val;
  btn.closest('.cc-btn-row').querySelectorAll('.cc-btn')
     .forEach(b => b.classList.remove('on'));
  btn.classList.add('on');
  clzCalc();
}

function syncCov(v){
  document.getElementById('cc-cov-num').value = v;
  clzCalc();
}
function syncCovNum(v){
  const cov = Math.min(300, Math.max(50, Math.round(parseFloat(v)/10)*10)) || 100;
  document.getElementById('cc-cov-num').value = cov;
  document.getElementById('cc-cov-range').value = cov;
  clzCalc();
}

function clzROC(){
  const y = parseInt(document.getElementById('cc-roc-y').value);
  const m = parseInt(document.getElementById('cc-roc-m').value);
  const d = parseInt(document.getElementById('cc-roc-d').value);
  const tag = document.getElementById('cc-age-tag');
  const ageEl = document.getElementById('cc-age-num');

  if(!y || !m || !d || y < 40 || y > 114 || m < 1 || m > 12 || d < 1 || d > 31){
    tag.classList.remove('vis','cc-age-err');
    return;
  }
  const gy = y + 1911;
  const dob = new Date(gy, m-1, d);
  if(dob.getMonth() !== m-1){ tag.classList.remove('vis'); return; }

  const now = new Date();
  let ay = now.getFullYear() - dob.getFullYear();
  const thisYrBday = new Date(now.getFullYear(), dob.getMonth(), dob.getDate());
  if(now < thisYrBday) ay--;
  const lastBdayYr = now >= thisYrBday ? now.getFullYear() : now.getFullYear()-1;
  const halfBday = new Date(lastBdayYr, dob.getMonth()+6, dob.getDate());
  const insAge = ay + (now > halfBday ? 1 : 0);

  // check range
  const per = _cc.per;
  const maxAge = per === 20 ? 50 : 60;
  const btn20 = document.getElementById('btn20yr');
  if(insAge > 50){
    btn20.disabled = true; btn20.classList.remove('on');
    if(_cc.per === 20){ _cc.per = 10; document.getElementById('btn10yr').classList.add('on'); }
  } else {
    btn20.disabled = false;
  }

  const valid = insAge >= 18 && insAge <= (_cc.per === 20 ? 50 : 60);
  tag.classList.add('vis');
  if(!valid){
    tag.classList.add('cc-age-err');
    ageEl.textContent = insAge + ' 歲（超出投保範圍）';
    return;
  }
  tag.classList.remove('cc-age-err');
  ageEl.textContent = insAge;
  clzCalc();
}

function clzCalc(){
  const y = parseInt(document.getElementById('cc-roc-y').value);
  const m = parseInt(document.getElementById('cc-roc-m').value);
  const d = parseInt(document.getElementById('cc-roc-d').value);
  if(!y || !m || !d) return;

  const gy = y + 1911;
  const dob = new Date(gy, m-1, d);
  if(dob.getMonth() !== m-1) return;

  const now = new Date();
  let ay = now.getFullYear() - dob.getFullYear();
  const thisYrBday2 = new Date(now.getFullYear(), dob.getMonth(), dob.getDate());
  if(now < thisYrBday2) ay--;
  const lastBdayYr2 = now >= thisYrBday2 ? now.getFullYear() : now.getFullYear()-1;
  const halfBday2 = new Date(lastBdayYr2, dob.getMonth()+6, dob.getDate());
  const age = ay + (now > halfBday2 ? 1 : 0);

  const per = _cc.per;
  const freq = _cc.freq;
  const rateTable = _cc.product === 'CLX' ? CLX_RATES : CLZ_RATES;
  const rate = rateTable[per] && rateTable[per][age];
  if(!rate) return;

  const cov = parseInt(document.getElementById('cc-cov-num').value) || 100;
  const annual = rate * cov;
  const freqPrem = Math.round(annual * FREQ_FACTOR[freq]);
  const monthly = Math.round(annual / 12);
  const total = annual * per;
  const maturity = Math.round(total * 1.06);
  const hasDisc = document.getElementById('cc-discount').checked;
  const hasPayDisc = _cc.product === 'CLX' && document.getElementById('cc-pay-discount')?.checked && _cc.freq === 'annual';
  const discFactor = (hasDisc ? 0.99 : 1) * (hasPayDisc ? 0.99 : 1);
  const discounted = Math.round(annual * discFactor);

  const fmtMoney = v => Math.round(v).toLocaleString();
  const fmtWan = v => Number.isInteger(v) ? String(v) : String(Math.round(v * 10) / 10);
  const setText = (id, val) => { const el = document.getElementById(id); if(el) el.textContent = val; };

  const premBox = document.getElementById('cc-prem-box');
  if(premBox) premBox.classList.add('vis');

  setText('cc-annual', fmtMoney(annual));
  setText('cc-monthly', fmtMoney(monthly));
  setText('cc-total', fmtMoney(total));
  setText('cc-maturity', fmtMoney(maturity));
  setText('cc-cov-display', cov);
  setText('cc-specific-display', fmtWan(cov * 1.5));
  const productData = CALC_PRODUCTS[_cc.product];
  const specificNote = document.getElementById('cc-specific-note');
  if(specificNote) specificNote.innerHTML = `${productData.summary}，第6年起最高 <span id="b-specific-total" style="color:#d43050;font-weight:900;">${fmtWan(cov * 1.5)}</span> 萬`;

  const freqCol = document.getElementById('cc-freq-col');
  if(freqCol){
    if(freq !== 'annual'){
      freqCol.style.display = '';
      setText('cc-freq-lbl', FREQ_LABEL[freq]);
      setText('cc-freq-val', fmtMoney(freqPrem));
    } else {
      freqCol.style.display = 'none';
    }
  }

  const discCol = document.getElementById('cc-disc-col');
  if(discCol){
    if(hasDisc || hasPayDisc){
      discCol.style.display = '';
      setText('cc-discounted', fmtMoney(discounted));
    } else {
      discCol.style.display = 'none';
    }
  }

  setText('bene-cov', fmtWan(cov));
  setText('b-heavy', fmtWan(cov));
  setText('b-specific', fmtWan(cov * 0.5));
  setText('b-specific-total', fmtWan(cov * 1.5));
  setText('b-light', fmtWan(cov * 0.1));
  setText('b-surgery', fmtWan(cov * 0.02));
  setText('b-disease', fmtWan(cov * 0.1));
  setText('b-maturity2', (maturity/10000).toFixed(1).replace(/\.0$/,''));

  setText('cc-sales-line',
    `以基本保額 ${fmtWan(cov)} 萬規劃，首次重度癌症可準備 ${fmtWan(cov)} 萬；若屬${_cc.product === 'CLX' ? '女性' : '男性'}特定癌症，最高可達 ${fmtWan(cov * 1.5)} 萬。年繳約 ${fmtMoney(annual)} 元，等於每月約 ${fmtMoney(monthly)} 元。`
  );
}

function clzSet(k,v,btn){
  _cc[k]=v;
  btn.closest('.cc-btn-row').querySelectorAll('.cc-btn').forEach(b=>b.classList.remove('on'));
  btn.classList.add('on');
  clzCalc();
}
// P10｜逐步播放 CLX 女性理賠故事（預設完整顯示）
let _clzStoryStep=0;
function clzTimelineStep(){
  const track=document.getElementById('clz-time-track');
  const label=document.getElementById('clz-story-btn-label');
  if(!track||!label)return;
  _clzStoryStep=_clzStoryStep>=5?1:_clzStoryStep+1;
  for(let i=1;i<=5;i++)track.classList.remove('story-step-'+i);
  track.classList.add('story-step-'+_clzStoryStep);
  label.textContent=_clzStoryStep===5?'重新播放':'下一個節點';
}
