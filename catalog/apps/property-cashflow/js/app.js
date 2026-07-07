(function(){
  var current='home', aMethod='wealth', bMethod='equal', dMethod='equal', cMethod='equal', dLifeBudgetMode='pct';
  var PFK2Y={"1":{"0":[356,11575.68],"1":[370,11573.03],"2":[384,11571.18],"3":[398,11570.15],"4":[413,11570.05],"5":[429,11571.6],"6":[445,11572.38],"7":[461,11573.94],"8":[479,11577.26],"9":[497,11581.24],"10":[515,11585.49],"11":[534,11591.24],"12":[554,11598.12],"13":[574,11603.28],"14":[595,11607.65],"15":[617,11610.42],"16":[640,11613.34],"17":[664,11615.08],"18":[688,11614.92],"19":[714,11616.06],"20":[740,11615.96],"21":[768,11617.28],"22":[796,11616.92],"23":[826,11618.11],"24":[856,11617.88],"25":[888,11619.25],"26":[921,11620.96],"27":[955,11622.7],"28":[990,11624.57],"29":[1027,11626.96],"30":[1064,11627.7],"31":[1103,11628.88],"32":[1142,11629.17],"33":[1183,11630.05],"34":[1226,11631.49],"35":[1270,11632.42],"36":[1316,11634.47],"37":[1363,11635.41],"38":[1412,11636.75],"39":[1463,11638.39],"40":[1516,11641.19],"41":[1573,11646.4],"42":[1632,11651.74],"43":[1693,11657.43],"44":[1757,11663.1],"45":[1823,11669.2],"46":[1891,11674.29],"47":[1962,11680.06],"48":[2035,11684.82],"49":[2111,11690.31],"50":[2190,11697.46],"51":[2269,11701.27],"52":[2352,11705.94],"53":[2437,11710.1],"54":[2526,11715.74],"55":[2617,11719.65],"56":[2712,11725.51],"57":[2811,11731.6],"58":[2913,11736.41],"59":[3018,11741.39],"60":[3128,11748.21],"61":[3254,11764.33],"62":[3386,11780.69],"63":[3523,11796.44],"64":[3665,11811.04],"65":[3814,11825.57],"66":[3968,11832.48],"67":[4129,11836.33],"68":[4296,11831.36],"69":[4470,11819.2],"70":[4650,11793.58],"71":[4764,11746.31],"72":[4881,11692.41],"73":[5000,11629.94],"74":[5000,11433.16],"75":[5000,11367.01],"76":[5000,11300.24],"77":[5000,11258.7],"78":[5000,11261.78]},"2":{"0":[270,11561.79],"1":[280,11558.05],"2":[291,11555.9],"3":[302,11555.19],"4":[313,11552.67],"5":[325,11552.99],"6":[338,11554.09],"7":[350,11553.57],"8":[363,11554.11],"9":[377,11556.36],"10":[391,11558.97],"11":[406,11561.82],"12":[422,11566.55],"13":[438,11570.08],"14":[454,11572.48],"15":[471,11574.3],"16":[489,11576.02],"17":[508,11578.15],"18":[527,11579.65],"19":[547,11580.07],"20":[567,11581.26],"21":[588,11582.19],"22":[610,11583.51],"23":[633,11584.83],"24":[657,11586.96],"25":[682,11588.6],"26":[708,11591.04],"27":[734,11591.37],"28":[762,11592.8],"29":[790,11593.97],"30":[821,11597.11],"31":[852,11598.56],"32":[884,11599.82],"33":[917,11600.96],"34":[951,11601.77],"35":[987,11603.34],"36":[1024,11604.47],"37":[1062,11605.3],"38":[1102,11606.88],"39":[1144,11608.62],"40":[1186,11609.33],"41":[1234,11615.66],"42":[1283,11620.11],"43":[1334,11625.87],"44":[1387,11631.01],"45":[1442,11634.95],"46":[1499,11639.55],"47":[1559,11644.4],"48":[1621,11649.36],"49":[1685,11652.99],"50":[1753,11659.57],"51":[1825,11667.63],"52":[1899,11674.24],"53":[1977,11682.61],"54":[2057,11688.89],"55":[2141,11696.76],"56":[2228,11703.21],"57":[2319,11711.03],"58":[2413,11717.59],"59":[2512,11725.5],"60":[2613,11732.14],"61":[2723,11744.22],"62":[2838,11755.49],"63":[2957,11766.76],"64":[3082,11777.68],"65":[3212,11789.41],"66":[3347,11800.17],"67":[3488,11811.69],"68":[3635,11821.6],"69":[3788,11829.05],"70":[3948,11828.76],"71":[4199,11855.16],"72":[4466,11863.12],"73":[4750,11846.4],"74":[4800,11636.6],"75":[4850,11572.38],"76":[4900,11506.16],"77":[4950,11437.74],"78":[5000,11368.5]}};
  var MARKET_CSV_URL='https://docs.google.com/spreadsheets/d/e/2PACX-1vTlWEVTc0tmVbJfFWoKfOIIjmFDeiBKCqQGtgflSfV280ul1EjXP-1UexQORI1dUt0cZsIQnKoQmJgp/pub?gid=971675466&single=true&output=csv';
  var market={fxRate:31.6947,fxDate:'2026-06-24',audRate:22.4251,audDate:'2026-05-27',funds:[
    {name:'DSP5（安聯收益成長 AM 美元）',rate:0.055,nav:8.9035,navDate:'2026-06-24',currency:'USD'},
    {name:'NGB1（高盛環球高收益 X 美元）',rate:0.51,nav:38.55,navDate:'2026-06-24',currency:'USD'},
    {name:'ACE17（聯博 美國成長 AP 美元）',rate:0.8322,nav:73.47,navDate:'2026-06-24',currency:'USD'}
  ]};
  function $(id){return document.getElementById(id)}
  function num(id){var el=$(id); return el? Number(el.value||0):0}
  function setText(id,v){
    var el=$(id); if(!el) return;
    var text=String(v), numeric=text.replace(/[$,月萬%]/g,'');
    var isMoney=/^-?\$[\d,]+$/.test(text), isPct=/^-?\d+%$/.test(text);
    var target=parseFloat(numeric);
    var shouldAnimate=(isMoney||isPct) && isFinite(target) && (el.tagName==='B'||el.tagName==='STRONG');
    if(!shouldAnimate){el.textContent=text; return;}
    var prev=parseFloat(el.dataset.raw || '0');
    if(Math.abs(prev-target)<1){el.textContent=text; el.dataset.raw=String(target); return;}
    var start=performance.now(), dur=400;
    var from=prev, to=target;
    el.dataset.raw=String(target);
    function step(t){
      var p=Math.min((t-start)/dur,1); p=1-Math.pow(1-p,3);
      var val=from+(to-from)*p;
      var out=Math.round(Math.abs(val)).toLocaleString('en-US');
      el.textContent=(isMoney?(val<0?'-$':'$'):'')+out+suffix;
      if(p<1) requestAnimationFrame(step); else el.textContent=text;
    }
    var suffix=isPct?'%':'';
    requestAnimationFrame(step);
  }
  function money(n){var s=n<0?'-':''; n=Math.abs(Math.round(n)); return s+'$'+n.toLocaleString('en-US')}
  function wan(n){return Math.round(n).toLocaleString('en-US')+'萬'}
  function wan1(n){return (Math.round(n*10)/10).toLocaleString('en-US')+'萬'}
  function usdWan(n){return Number(n||0).toLocaleString('en-US',{maximumFractionDigits:1})+'萬美元'}
  function pct(n){if(!isFinite(n)) return '—'; return Math.round(n)+'%'}
  function clamp(v,min,max){return Math.max(min,Math.min(max,v))}
  function pay(amtWan,ratePct,years){var P=amtWan*10000,r=ratePct/100/12,m=years*12;if(P<=0||m<=0)return 0;if(r===0)return P/m;return P*r*Math.pow(1+r,m)/(Math.pow(1+r,m)-1)}
  function interestOnly(amtWan,ratePct){return amtWan*10000*(ratePct/100)/12}
  function parseLoose(s){var n=parseFloat(String(s==null?'':s).replace(/,/g,'').replace(/[^0-9.\-]/g,''));return isFinite(n)?n:NaN}
  function fundCode(name){var m=String(name||'').match(/^([^（\s]+)/);return m?m[1]:String(name||'')}
  function getFund(id){var sel=$(id), name=sel&&sel.value;return market.funds.find(function(f){return f.name===name})||market.funds[0]}
  function investFeeRate(twd){if(twd<2000000)return .05;if(twd<5000000)return .04;if(twd<10000000)return .03;return .02}
  function fundFx(fund,fxId){if(!fund||fund.currency==='TWD')return 1;if(fund.currency==='AUD')return market.audRate;return Math.max(num(fxId)||market.fxRate,1)}
  function estimateDividend(amountWan,fundId,fxId){
    var amount=amountWan*10000, fund=getFund(fundId), fx=fundFx(fund,fxId), fee=amount*investFeeRate(amount), net=amount-fee;
    if(!fund||amount<=0||!isFinite(fund.nav)||fund.nav<=0)return {monthly:0,annualYield:0,fund:null,fee:fee,net:net};
    var monthly=fund.currency==='TWD'?(net/fund.nav)*fund.rate:((net/fx)/fund.nav)*fund.rate*fx;
    return {monthly:monthly,annualYield:amount>0?monthly*12/amount*100:0,fund:fund,fee:fee,net:net};
  }
  function fundGrossYield(fund){
    if(!fund||!isFinite(fund.nav)||fund.nav<=0||!isFinite(fund.rate))return NaN;
    return fund.rate*12/fund.nav*100;
  }
  function populateFundSelects(){
    ['a-fund','b-fund','d-fund'].forEach(function(id){
      var sel=$(id); if(!sel) return;
      var old=sel.value; sel.innerHTML='';
      market.funds.forEach(function(f){var o=document.createElement('option');o.value=f.name;o.textContent=fundCode(f.name)+'｜'+f.currency+'｜淨值 '+Number(f.nav).toFixed(4).replace(/\.?0+$/,'');sel.appendChild(o)});
      sel.value=old&&market.funds.some(function(f){return f.name===old})?old:market.funds[0].name;
    });
  }
  function setMarketStatus(text){['a-market-status','b-market-status','d-market-status'].forEach(function(id){var el=$(id); if(el) el.textContent=text});}
  function syncFxFields(){
    ['a-fx','b-fx','d-fx'].forEach(function(id){var el=$(id); if(el&&!el.dataset.touched) el.value=Number(market.fxRate).toFixed(3)});
    ['a-fx-date','b-fx-date','d-fx-date'].forEach(function(id){var el=$(id); if(el) el.textContent='USD/TWD '+Number(market.fxRate).toFixed(3)+(market.fxDate?'｜'+market.fxDate:'')+'｜AUD/TWD '+Number(market.audRate).toFixed(3)});
  }
  function updateDividendNotes(){
    [['a','a-fund','a-fx'],['b','b-fund','b-fx'],['d','d-fund','d-fx']].forEach(function(x){
      var div=estimateDividend(100,x[1],x[2]), f=div.fund, el=$(x[0]+'-market-status');
      if(el&&f){var gy=fundGrossYield(f); el.textContent=fundCode(f.name)+' 淨值 '+Number(f.nav).toFixed(4).replace(/\.?0+$/,'')+'｜配息率 '+(isFinite(gy)?gy.toFixed(2)+'%':'—');}
    });
  }
  function parseCsvLine(line){var out=[],cur='',q=false;for(var i=0;i<String(line).length;i++){var c=line[i],n=line[i+1];if(c==='"'&&q&&n==='"'){cur+='"';i++;continue}if(c==='"'){q=!q;continue}if(c===','&&!q){out.push(cur);cur='';continue}cur+=c}out.push(cur);return out}
  function parseCsv(text){var lines=String(text||'').split(/\r?\n/).filter(function(l){return l.trim()});if(!lines.length)return[];var hi=0,score=-1,keys=['code','nav','rate','dividend','基金','代碼','淨值','配息','日期','幣別','保單','宣告','更新','標的','name'];lines.slice(0,8).forEach(function(l,i){var s=parseCsvLine(l).length;keys.forEach(function(k){if(l.toLowerCase().indexOf(k.toLowerCase())>=0)s+=2});if(s>score){score=s;hi=i}});var h=parseCsvLine(lines[hi]).map(function(x){return x.trim()});return lines.slice(hi+1).map(function(l){var c=parseCsvLine(l),r={};h.forEach(function(k,i){r[k]=c[i]||''});return r})}
  function readField(row,keys){for(var i=0;i<keys.length;i++){if(row[keys[i]]!=null&&String(row[keys[i]]).trim()!=='')return row[keys[i]]}return''}
  function normalizeDate(s){var m=String(s||'').match(/(\d{4})[\/\-年\.](\d{1,2})[\/\-月\.](\d{1,2})/);return m?m[1]+'-'+String(parseInt(m[2],10)).padStart(2,'0')+'-'+String(parseInt(m[3],10)).padStart(2,'0'):''}
  function findMarketRow(rows,fund){
    var code=fundCode(fund.name).toUpperCase(), codeFields=['code','基金','基金代碼','基金/保單代碼','保單代碼','代碼'], nameFields=['name','基金名稱','標的名稱'];
    var exact=rows.find(function(r){
      return codeFields.some(function(k){return String(r[k]||'').trim().toUpperCase()===code})||nameFields.some(function(k){return String(r[k]||'').trim()===fund.name});
    });
    if(exact)return exact;
    return rows.find(function(r){
      return codeFields.some(function(k){var v=String(r[k]||'').trim().toUpperCase();return v&&v.indexOf(code)>=0})||nameFields.some(function(k){var v=String(r[k]||'').trim().toUpperCase();return v&&v.indexOf(code)>=0});
    });
  }
  function refreshMarket(){
    setMarketStatus('更新中...');
    return fetch(MARKET_CSV_URL+'&cacheBust='+Date.now(),{cache:'no-store'}).then(function(res){if(!res.ok)throw new Error('HTTP '+res.status);return res.text()}).then(function(csv){
      var rows=parseCsv(csv), updated=0, fxUpdated=false;
      market.funds.forEach(function(f){var r=findMarketRow(rows,f); if(!r)return; var nav=parseLoose(readField(r,['nav','淨值','最新淨值','即時淨值'])); if(!isFinite(nav)){['即時淨值/宣告利率','淨值/利率','淨值/宣告利率'].some(function(k){var raw=String(r[k]||''); if(raw.indexOf('%')>=0||raw.indexOf('％')>=0||raw.indexOf('利率')>=0)return false; nav=parseLoose(raw); return isFinite(nav)})} if(isFinite(nav)&&nav>0){f.nav=nav;f.navDate=normalizeDate(readField(r,['date','日期','navDate','更新日期']))||new Date().toISOString().slice(0,10);updated++} var dist=parseLoose(readField(r,['rate','dividend','配息','每單位配息','每單位配息金額','宣告利率'])); if(isFinite(dist)&&dist>0&&dist<100){f.rate=dist;} var cur=readField(r,['currency','幣別']); if(cur)f.currency=cur;});
      var fxRow=rows.find(function(r){return ['code','基金','基金代碼','基金/保單代碼','保單代碼','代碼'].some(function(k){var v=String(r[k]||'').trim().toUpperCase();return v==='FX'||v==='USD/TWD'||v==='USDTWD'})});
      if(fxRow){var fx=parseLoose(readField(fxRow,['nav','rate','匯率','fxRate','即時淨值','即時淨值/宣告利率']));if(isFinite(fx)&&fx>0&&fx<100){market.fxRate=fx;market.fxDate=normalizeDate(readField(fxRow,['date','日期','更新日期']))||new Date().toISOString().slice(0,10);fxUpdated=true}}
      var audRow=rows.find(function(r){return ['code','基金','基金代碼','基金/保單代碼','保單代碼','代碼'].some(function(k){var v=String(r[k]||'').trim().toUpperCase();return v==='AUD/TWD'||v==='AUDTWD'})});
      if(audRow){var aud=parseLoose(readField(audRow,['nav','rate','匯率','fxRate','即時淨值','即時淨值/宣告利率']));if(isFinite(aud)&&aud>0&&aud<100){market.audRate=aud;market.audDate=normalizeDate(readField(audRow,['date','日期','更新日期']))||new Date().toISOString().slice(0,10);fxUpdated=true}}
      populateFundSelects(); syncFxFields(); updateDividendNotes(); calcAll(); setMarketStatus((updated||fxUpdated)?'已更新 '+(updated?'淨值'+updated+'檔 ':'')+(fxUpdated?'匯率 ':'')+'｜'+(market.fxDate||new Date().toISOString().slice(0,10)):'已讀取但未對應');
    }).catch(function(){setMarketStatus('更新失敗，使用內建資料'); updateDividendNotes();});
  }
  function estimateInsurance(coverWan,ageId,sexId,fxId){
    var age=clamp(Math.round(num(ageId)),0,78), sex=($(sexId)&&$(sexId).value)||'1', fx=Math.max(num(fxId)||32,1);
    var row=PFK2Y[sex]&&PFK2Y[sex][String(age)];
    if(!row||coverWan<=0)return {premiumWan:0,matchedDeathWan:0,sumW:0,totalUsd:0,annualUsd:0,age:age,sex:sex,fx:fx,limited:false};
    var gp=row[0], deathPerWan=row[1], targetUsd=coverWan*10000/fx;
    var maxSum=age<=15?30:200, minSum=2;
    var sumW=clamp(Math.round(targetUsd/deathPerWan*10)/10,minSum,maxSum);
    var candidates=[sumW-0.1,sumW,sumW+0.1].map(function(v){return clamp(Math.round(v*10)/10,minSum,maxSum)});
    sumW=candidates.reduce(function(best,v){return Math.abs(v*deathPerWan-targetUsd)<Math.abs(best*deathPerWan-targetUsd)?v:best},sumW);
    var rawAnnual=Math.round(gp*sumW), annualUsd=Math.round(rawAnnual*0.98), totalUsd=annualUsd*2;
    return {premiumWan:totalUsd*fx/10000,matchedDeathWan:sumW*deathPerWan*fx/10000,sumW:sumW,totalUsd:totalUsd,annualUsd:annualUsd,age:age,sex:sex,fx:fx,limited:targetUsd>maxSum*deathPerWan};
  }

  function estimateInsuranceByAnnualBudget(annualBudgetWan,ageId,sexId,fxId){
    var age=clamp(Math.round(num(ageId)),0,78), sex=($(sexId)&&$(sexId).value)||'1', fx=Math.max(num(fxId)||32,1);
    var row=PFK2Y[sex]&&PFK2Y[sex][String(age)];
    if(!row||annualBudgetWan<=0)return {annualBudgetWan:0,totalBudgetWan:0,matchedDeathWan:0,sumW:0,totalUsd:0,annualUsd:0,age:age,sex:sex,fx:fx,limited:false};
    var gp=row[0], deathPerWan=row[1], maxSum=age<=15?30:200, minSum=2;
    var targetAnnualUsd=annualBudgetWan*10000/fx;
    var sumW=clamp(Math.round((targetAnnualUsd/(gp*0.98))*10)/10,minSum,maxSum);
    var candidates=[sumW-0.1,sumW,sumW+0.1].map(function(v){return clamp(Math.round(v*10)/10,minSum,maxSum)});
    sumW=candidates.reduce(function(best,v){return Math.abs(gp*v*0.98-targetAnnualUsd)<Math.abs(gp*best*0.98-targetAnnualUsd)?v:best},sumW);
    var annualUsd=Math.round(gp*sumW*0.98), totalUsd=annualUsd*6;
    var actualAnnualWan=annualUsd*fx/10000;
    return {annualBudgetWan:actualAnnualWan,totalBudgetWan:actualAnnualWan*6,matchedDeathWan:sumW*deathPerWan*fx/10000,sumW:sumW,totalUsd:totalUsd,annualUsd:annualUsd,age:age,sex:sex,fx:fx,limited:sumW>=maxSum&&targetAnnualUsd>gp*maxSum*0.98};
  }

  function pfjPad2(n){return String(parseInt(n,10)).padStart(2,'0')}
  function pfjKey(period,sex,age){return 'PFJ'+pfjPad2(period)+pfjPad2(sex)+pfjPad2(age)}
  function pfjLookup(T,name,k,idx){var arr=T&&T[name]&&T[name][k]; if(!arr||idx<0||idx>=arr.length)return 0; var v=arr[idx]; return v==null?0:Number(v)||0}
  function pfjCeil(x){return Math.ceil(x-1e-12)}
  function pfjRound(x){return Math.floor(x+0.5)}
  function pfjCalcDiscount(sumW){var pct=1; if(sumW>=15)pct+=1; return Math.min(pct,2)}
  function pfjMaxSum(age){return age<=15?30:300}
  function pfjClampSum(sumW,age){return clamp(sumW,2,pfjMaxSum(age))}
  function pfjAnnualDiscUsd(sex,age,sumW){
    var T=window.PFJ_TABLES, k=pfjKey(6,sex,age), rate=T&&T.GP&&T.GP[k];
    if(!rate)return 0;
    var annualOrig=pfjRound(sumW*rate), pct=pfjCalcDiscount(sumW);
    return pfjCeil(annualOrig*(100-pct)/100);
  }
  function pfjCompute(sex,age,sumW){
    var T=window.PFJ_TABLES, period=6, base=pfjKey(period,sex,age), rate=T&&T.GP&&T.GP[base];
    if(!rate)return null;
    sumW=pfjClampSum(sumW,age);
    var annualOrig=pfjRound(sumW*rate), discountPct=pfjCalcDiscount(sumW), annualDisc=pfjCeil(annualOrig*(100-discountPct)/100), maxY=110-age+1;
    var bonusKind=2, bonuKey=base+String(bonusKind), Ks=[], Ms=[], Zs=[], z=0;
    for(var yr=1;yr<=maxY;yr++){
      var idx=yr-1, bonu=pfjLookup(T,'BONU',bonuKey,idx), K=0, M=0;
      if(yr!==1){
        var t1=pfjCeil(sumW*bonu), t2=pfjCeil(z*bonu/10000); K=t1+t2;
        if(yr<maxY){var pvfbNext=pfjLookup(T,'PVFB',base,yr); M=pvfbNext?pfjRound(K*10000/pvfbNext):0;}
      }
      z+=M; Ks.push(K); Ms.push(M); Zs.push(z);
    }
    var rows=[], Kmax=Ks[maxY-1]||0;
    for(var y=1;y<=maxY;y++){
      var i=y-1;
      var A=pfjRound(sumW*pfjLookup(T,'DIE',base,i));
      var B=pfjRound(sumW*pfjLookup(T,'CV',base,i));
      var D=pfjCeil(sumW*pfjLookup(T,'BONUDIE',bonuKey,i));
      var E=pfjCeil(sumW*pfjLookup(T,'BONUCV',bonuKey,i));
      var die2=pfjLookup(T,'_DIE2',base,i), pvfb0=pfjLookup(T,'PVFB0',base,y), Zi=Zs[i];
      var X=pfjCeil(Zi*die2/10000), Y=pfjCeil(Zi*pvfb0/10000);
      if(y>=maxY){X+=Kmax;Y+=Kmax;}
      rows.push({year:y,age:age+y-1,paid_yr:y<=period?annualDisc:0,paid_cum:annualDisc*Math.min(y,period),death:A+D+X,surr:B+E+Y});
    }
    return {sumW:Math.round(sumW*10)/10,annualDiscUsd:annualDisc,totalDiscUsd:annualDisc*6,discountPct:discountPct,rows:rows};
  }
  function pfjFromAnnualBudget(annualBudgetWan,ageId,sexId,fxId){
    var age=clamp(Math.round(num(ageId)),0,76), sex=($(sexId)&&$(sexId).value)||'1', fx=Math.max(num(fxId)||32,1), targetUsd=annualBudgetWan*10000/fx;
    if(!window.PFJ_TABLES||targetUsd<=0)return {sumW:0,annualBudgetWan:0,totalBudgetWan:0,death6Wan:0,surr6Wan:0,annualUsd:0,totalUsd:0,age:age,sex:sex,fx:fx,discountPct:0};
    var rate=window.PFJ_TABLES.GP&&window.PFJ_TABLES.GP[pfjKey(6,sex,age)];
    if(!rate)return {sumW:0,annualBudgetWan:0,totalBudgetWan:0,death6Wan:0,surr6Wan:0,annualUsd:0,totalUsd:0,age:age,sex:sex,fx:fx,discountPct:0};
    var approx=pfjClampSum(targetUsd/(rate*0.98),age), best=approx, bestDiff=Math.abs(pfjAnnualDiscUsd(sex,age,approx)-targetUsd);
    var candidates=[];
    for(var d=-20;d<=20;d++){candidates.push(pfjClampSum(Math.round((approx+d*0.1)*10)/10,age));}
    candidates.forEach(function(c){var diff=Math.abs(pfjAnnualDiscUsd(sex,age,c)-targetUsd); if(diff<bestDiff){best=c;bestDiff=diff;}});
    var r=pfjCompute(sex,age,best), row6=r&&r.rows[5]||{death:0,surr:0};
    return {sumW:r?r.sumW:0,annualBudgetWan:r?r.annualDiscUsd*fx/10000:0,totalBudgetWan:r?r.totalDiscUsd*fx/10000:0,death6Wan:row6.death*fx/10000,surr6Wan:row6.surr*fx/10000,annualUsd:r?r.annualDiscUsd:0,totalUsd:r?r.totalDiscUsd:0,age:age,sex:sex,fx:fx,discountPct:r?r.discountPct:0};
  }
  
  function go(id){
    document.querySelectorAll('.slide').forEach(s=>s.classList.toggle('active',s.id===id));
    document.querySelectorAll('.rail-item').forEach(b=>b.classList.toggle('active',b.dataset.go===id));
    current=id; 
    if(id==='toolA') setToolAStep('mortgage', false);
    if(id==='toolB') setToolBStep('property', false);
    if(id==='toolD') setToolDStep('property', false);
    calcAll();
  }

  function setToolAStep(step, shouldScroll){
    var section=$('toolA'); if(!section) return;
    var showResult=step==='result';
    var showSafety=step==='safety';
    section.classList.toggle('show-safety', showSafety);
    section.classList.toggle('show-result', showResult);
    calcA();
    if(shouldScroll!==false) section.scrollIntoView({behavior:'smooth', block:'start'});
  }

  function setToolBStep(step, shouldScroll){
    var section=$('toolB'); if(!section) return;
    var showResult=step==='result';
    var showSafety=step==='safety';
    section.classList.toggle('show-safety', showSafety);
    section.classList.toggle('show-result', showResult);
    calcB();
    if(shouldScroll!==false) section.scrollIntoView({behavior:'smooth', block:'start'});
  }

  function setToolDStep(step, shouldScroll){
    var section=$('toolD'); if(!section) return;
    var showResult=step==='result';
    var showSafety=step==='safety';
    section.classList.toggle('show-safety', showSafety);
    section.classList.toggle('show-result', showResult);
    calcD();
    if(shouldScroll!==false) section.scrollIntoView({behavior:'smooth', block:'start'});
  }
  
  document.addEventListener('click',function(e){
    var g=e.target.closest('[data-go]'); if(g){go(g.dataset.go)} 
    var chip=e.target.closest('[data-set]'); 
    if(chip){
      var target=$(chip.dataset.set); 
      if(target){
        target.value=chip.dataset.val; 
        if(chip.dataset.set==='b-active-pct'){
          $('b-active-amount').value=Math.round(num('b-home-value')*num('b-active-pct')/100);
          $('b-drawn').value=$('b-active-amount').value;
        }
        if(chip.dataset.set==='b-active-amount'&&$('b-drawn')){
          $('b-drawn').value=$('b-active-amount').value;
        }
        if(chip.dataset.set==='d-active-pct'){
          $('d-active-amount').value=Math.round(num('d-home-value')*num('d-active-pct')/100);
          $('d-drawn').value=$('d-active-amount').value;
        }
        if(chip.dataset.set==='d-active-amount'&&$('d-drawn')){
          $('d-drawn').value=$('d-active-amount').value;
        }
        if(chip.dataset.set==='d-life-budget') dLifeBudgetMode='amount';
        if(chip.dataset.set==='d-life-budget-pct') dLifeBudgetMode='pct';
        calcAll();
      }
    }
  });

  document.querySelectorAll('input').forEach(i=>i.addEventListener('input',function(){
    if(i.id==='a-fx'||i.id==='b-fx'||i.id==='d-fx') i.dataset.touched='1';
    if(i.id==='b-active-pct'){
      $('b-active-amount').value=Math.round(num('b-home-value')*num('b-active-pct')/100);
      $('b-drawn').value=$('b-active-amount').value;
    }
    if(i.id==='b-active-amount'&&$('b-drawn')) $('b-drawn').value=i.value;
    if(i.id==='d-active-pct'){
      $('d-active-amount').value=Math.round(num('d-home-value')*num('d-active-pct')/100);
      $('d-drawn').value=$('d-active-amount').value;
    }
    if(i.id==='d-active-amount'&&$('d-drawn')) $('d-drawn').value=i.value;
    if(i.id==='d-life-budget') dLifeBudgetMode='amount';
    if(i.id==='d-life-budget-pct') dLifeBudgetMode='pct';
    calcAll();
  }));
  document.querySelectorAll('select').forEach(s=>s.addEventListener('change',function(){updateDividendNotes();calcAll()}));

  $('a-method-equal').onclick=function(){aMethod='equal';toggleMethods();calcA()};
  $('a-method-wealth').onclick=function(){aMethod='wealth';toggleMethods();calcA()};
  $('b-method-equal').onclick=function(){bMethod='equal';toggleMethods();calcB()};
  $('b-method-wealth').onclick=function(){bMethod='wealth';toggleMethods();calcB()};
  $('d-method-equal').onclick=function(){dMethod='equal';toggleMethods();calcD()};
  $('d-method-wealth').onclick=function(){dMethod='wealth';toggleMethods();calcD()};
  $('c-method-equal').onclick=function(){cMethod='equal';toggleMethods();calcC()};
  $('c-method-wealth').onclick=function(){cMethod='wealth';toggleMethods();calcC()};
  
  if($('b-use-required')) $('b-use-required').onclick=function(){
    $('b-active-amount').value=Math.round(num('b-home-value')*num('b-active-pct')/100); 
    $('b-drawn').value=$('b-active-amount').value; 
    calcB();
  }
  var mra=$('market-refresh-a'), mrb=$('market-refresh-b'), mrd=$('market-refresh-d'); if(mra)mra.onclick=refreshMarket; if(mrb)mrb.onclick=refreshMarket; if(mrd)mrd.onclick=refreshMarket;
  var showA=$('a-show-result'), backA=$('a-back-input'), nextSafety=$('a-next-safety'), backMortgage=$('a-back-mortgage'), stepMortgage=$('a-step-mortgage'), stepSafety=$('a-step-safety'), stepResult=$('a-step-result');
  if(showA)showA.onclick=function(){setToolAStep('result')};
  if(backA)backA.onclick=function(){setToolAStep('safety')};
  if(nextSafety)nextSafety.onclick=function(){setToolAStep('safety')};
  if(backMortgage)backMortgage.onclick=function(){setToolAStep('mortgage')};
  if(stepMortgage)stepMortgage.onclick=function(){setToolAStep('mortgage')};
  if(stepSafety)stepSafety.onclick=function(){setToolAStep('safety')};
  if(stepResult)stepResult.onclick=function(){setToolAStep('result')};
  var bNextSafety=$('b-next-safety'), bBackProperty=$('b-back-property'), bShowResult=$('b-show-result'), bBackInput=$('b-back-input'), bStepProperty=$('b-step-property'), bStepSafety=$('b-step-safety'), bStepResult=$('b-step-result');
  if(bNextSafety)bNextSafety.onclick=function(){setToolBStep('safety')};
  if(bBackProperty)bBackProperty.onclick=function(){setToolBStep('property')};
  if(bShowResult)bShowResult.onclick=function(){setToolBStep('result')};
  if(bBackInput)bBackInput.onclick=function(){setToolBStep('safety')};
  if(bStepProperty)bStepProperty.onclick=function(){setToolBStep('property')};
  if(bStepSafety)bStepSafety.onclick=function(){setToolBStep('safety')};
  if(bStepResult)bStepResult.onclick=function(){setToolBStep('result')};
  var dNextSafety=$('d-next-safety'), dBackProperty=$('d-back-property'), dShowResult=$('d-show-result'), dStepProperty=$('d-step-property'), dStepSafety=$('d-step-safety'), dStepResult=$('d-step-result');
  if(dNextSafety)dNextSafety.onclick=function(){setToolDStep('safety')};
  if(dBackProperty)dBackProperty.onclick=function(){setToolDStep('property')};
  if(dShowResult)dShowResult.onclick=function(){setToolDStep('result')};
  if(dStepProperty)dStepProperty.onclick=function(){setToolDStep('property')};
  if(dStepSafety)dStepSafety.onclick=function(){setToolDStep('safety')};
  if(dStepResult)dStepResult.onclick=function(){setToolDStep('result')};

  function toggleMethods(){
    $('a-method-equal').classList.toggle('active',aMethod==='equal'); $('a-method-wealth').classList.toggle('active',aMethod==='wealth'); document.querySelectorAll('.a-equal-only').forEach(x=>x.classList.toggle('hidden',aMethod!=='equal')); document.querySelectorAll('.a-wealth-only').forEach(x=>x.classList.toggle('hidden',aMethod!=='wealth'));
    $('b-method-equal').classList.toggle('active',bMethod==='equal'); $('b-method-wealth').classList.toggle('active',bMethod==='wealth'); document.querySelectorAll('.b-equal-only').forEach(x=>x.classList.toggle('hidden',bMethod!=='equal')); document.querySelectorAll('.b-wealth-only').forEach(x=>x.classList.toggle('hidden',bMethod!=='wealth'));
    $('d-method-equal').classList.toggle('active',dMethod==='equal'); $('d-method-wealth').classList.toggle('active',dMethod==='wealth'); document.querySelectorAll('.d-equal-only').forEach(x=>x.classList.toggle('hidden',dMethod!=='equal')); document.querySelectorAll('.d-wealth-only').forEach(x=>x.classList.toggle('hidden',dMethod!=='wealth'));
    $('c-method-equal').classList.toggle('active',cMethod==='equal'); $('c-method-wealth').classList.toggle('active',cMethod==='wealth'); document.querySelectorAll('.c-equal-only').forEach(x=>x.classList.toggle('hidden',cMethod!=='equal')); document.querySelectorAll('.c-wealth-only').forEach(x=>x.classList.toggle('hidden',cMethod!=='wealth'));
  }
  
  function setBar(id,val){var el=$(id); if(el) el.style.width=clamp(val,0,100)+'%'}

  function calcA(){
    var cur=num('a-current-loan'), curPay=pay(cur,num('a-current-rate'),num('a-current-years'));
    var extra=num('a-extra'), rate=num('a-extra-rate');
    var baseCost=aMethod==='equal'?pay(extra,rate,num('a-extra-years')):interestOnly(extra,rate);
    var cover=num('a-cover');
    var ins=estimateInsurance(cover,'a-ins-age','a-ins-sex','a-fx');
    var lifeTotal=ins.premiumWan; // PFK 兩年期：以第六年身故金最接近目標保額回推兩年保費
    var firstYearPremium=lifeTotal/2, secondYearPremium=lifeTotal-firstYearPremium;
    var policyRate=4; // 系統隱藏參數：保單增貸利率固定 4%
    if($('a-premium')) $('a-premium').value=lifeTotal;
    if($('a-policy-rate')) $('a-policy-rate').value=policyRate;
    var totalLoan=cur+extra, reserveWan=num('a-reserve'), reserve=reserveWan*10000;

    // 保留現金：從增貸資金中先留在身邊，不參與配息、不支付壽險
    // 方案A：增貸金額先扣除壽險成本與保留現金，剩餘才投入配息
    var investP1=Math.max(extra-lifeTotal-reserveWan,0);
    var divP1=estimateDividend(investP1,'a-fund','a-fx'), incomeP1=divP1.monthly;
    var d1=curPay+baseCost-incomeP1;
    var relief1=curPay-d1;

    // 方案B：投入V月配息＝貸款金額－預留金額－PFK首年保費；第二年保費由保單借款支應
    var investP2=Math.max(extra-reserveWan-firstYearPremium,0);
    var divP2=estimateDividend(investP2,'a-fund','a-fx'), incomeP2=divP2.monthly;
    var policyCost=secondYearPremium*10000*policyRate/100/12;
    var d2=curPay+baseCost+policyCost-incomeP2;
    var relief2=curPay-d2;

    var useP2=relief2>=relief1, bestD=useP2?d2:d1, bestRelief=useP2?relief2:relief1, bestIncome=useP2?incomeP2:incomeP1;
    var coverRate=totalLoan>0?cover/totalLoan*100:0, reserveMonths=baseCost>0?reserve/baseCost:0;
    var stressYieldPressure=useP2?curPay+baseCost+policyCost-incomeP2*.8:curPay+baseCost-incomeP1*.8;
    var stressCost=aMethod==='equal'?pay(extra,rate+1,num('a-extra-years')):interestOnly(extra,rate+1);
    var stressRatePressure=useP2?curPay+stressCost+policyCost-incomeP2:curPay+stressCost-incomeP1;
    var extraValue=relief2-relief1;

    setText('a-current-pay',money(curPay)); setText('a-extra-pay',money(baseCost)); setText('a-income-p1',money(incomeP1)); setText('a-income-p2',money(incomeP2)); setText('a-after-pressure',money(bestD)); setText('a-relief',money(bestRelief)); setText('a-total-month-pay',money(curPay+baseCost));
    setText('a-mortgage-current',money(curPay)); setText('a-mortgage-extra',money(baseCost)); setText('a-mortgage-total',money(curPay+baseCost)); setText('a-mortgage-note',aMethod==='wealth'?'目前採理財型循環息估算新增資金成本。':'目前採一般本息平均估算新增資金成本。');
    setText('a-safety-invest',wan(investP2)); setText('a-safety-income',money(incomeP2)); setText('a-safety-premium',wan1(lifeTotal)); setText('a-safety-policy',money(policyCost));
    setText('a-cover-show',wan(cover)); setText('a-policy-sum',usdWan(ins.sumW)); setText('a-premium-show',wan1(lifeTotal)); setText('a-reserve-show',wan(reserveWan));
    setText('a-baseline-current',money(curPay)); setText('a-baseline-total',money(curPay+baseCost)); setText('a-baseline-best',money(bestD));
    setText('a-p1-d',money(d1)); setText('a-p1-final-mortgage',money(d1)); setText('a-p1-relief',money(relief1)); setText('a-p1-invest',wan(investP1)); setText('a-p1-life-cost',wan1(lifeTotal)); setText('a-p2-invest',wan(investP2)); setText('a-p2-life-cost',wan1(firstYearPremium)); setText('a-p2-d',money(d2)); setText('a-p2-final-mortgage',money(d2)); setText('a-p2-relief',money(relief2)); setText('a-policy-cost',money(policyCost));
    setText('a-cover-rate',pct(coverRate)); setText('a-reserve-months',reserveMonths.toFixed(1)+'月'); setText('a-stress-yield',money(stressYieldPressure)); setText('a-stress-rate',money(stressRatePressure)); setText('a-total-loan',wan(totalLoan)); setText('a-best-plan',useP2?'方案B':'方案A'); setText('a-ins-match',wan1(ins.matchedDeathWan));
    setText('home-relief',money(bestRelief)); setText('a-lens-now',money(curPay)); setText('a-lens-after',money(bestD)); setText('a-lens-save',money(bestRelief));
    
    var maxFlow=Math.max(curPay+baseCost+policyCost,incomeP2,incomeP1,1);
    setBar('a-bar-a',curPay/maxFlow*100); setBar('a-bar-b',baseCost/maxFlow*100); setBar('a-bar-c1',incomeP1/maxFlow*100); setBar('a-bar-c2',incomeP2/maxFlow*100);
    setText('a-bar-a-val',money(curPay)); setText('a-bar-b-val',money(baseCost)); setText('a-bar-c1-val',money(incomeP1)); setText('a-bar-c2-val',money(incomeP2));
    
    var title=bestRelief>0?'最佳方案：'+(useP2?'方案B 扣首年保費後投入':'方案A 扣兩年保費後投入'):'系統提示：尚未形成月減壓';
    var fundText=divP2.fund?fundCode(divP2.fund.name)+' 依投入額估算年化約 '+divP2.annualYield.toFixed(2)+'%。':'月配息標的未設定。';
    var insText='PFK兩年期以 '+(ins.sex==='1'?'男性':'女性')+' '+ins.age+' 歲、匯率 '+ins.fx+' 估算，匹配保額 '+ins.sumW+' 萬美元，第六年身故金約 '+wan1(ins.matchedDeathWan)+'，兩年保費約 '+wan1(lifeTotal)+'。月配息採 '+fundText;
    var planCopy='方案A：先保留現金 '+wan(reserveWan)+'，再扣兩年壽險成本 '+wan1(lifeTotal)+'，剩下 '+wan(investP1)+' 投入配息，活化後月付 '+money(d1)+'，每月減壓 '+money(relief1)+'。\n方案B：貸款金額扣除保留現金 '+wan(reserveWan)+' 與PFK首年保費 '+wan1(firstYearPremium)+' 後，將 '+wan(investP2)+' 投入V月配息；第二年保費 '+wan1(secondYearPremium)+' 由保單借款支應，每月借款利息 '+money(policyCost)+'，活化後月付 '+money(d2)+'，每月減壓 '+money(relief2)+'。\n'+insText;
    var copy;
    if(bestRelief>0){
      copy='現在月付約 '+money(curPay)+'。採用 '+(useP2?'方案B':'方案A')+' 後，每月實際壓力約 '+money(bestD)+'，每月可減壓 '+money(bestRelief)+'。壽險成本已依 '+insText+(useP2 && extraValue>0?'方案B 比方案A 每月再多省約 '+money(extraValue)+'，原因是方案B只先扣PFK首年保費，第二年保費改由保單借款支應。':'');
    }else{
      copy='目前配息收入還不足以抵掉新增月成本，月壓力不會變輕。建議降低活化金額、改用理財型計息，或重新檢視配息工具條件。';
    }
    setText('a-plan-copy',planCopy); setText('a-decision',title); setText('a-decision-copy',copy);
    setText('a-client-headline',bestRelief>0?'活化後月付約 '+money(bestD)+'。':'目前未形成減壓，請調整金額或標的。');
    setText('a-client-sub',bestRelief>0?'現在月付約 '+money(curPay)+'，每月約可減少 '+money(bestRelief)+'。':'先降低新增成本，或換成更適合的月配息標的，再讓結果轉正。');
    setText('a-judge',useP2?'建議看方案B：貸款金額扣預留金額與PFK首年保費後投入V月配息，第二年保費由保單借款支應。':'建議看方案A：先保留現金並扣除兩年壽險成本，剩餘資金再投入配息。');
    
    var maxV=Math.max(curPay,baseCost+(useP2?policyCost:0),bestIncome,1);
    setBar('a-viz-a',curPay/maxV*100); setBar('a-viz-b',(baseCost+(useP2?policyCost:0))/maxV*100); setBar('a-viz-c',bestIncome/maxV*100);
    setText('a-viz-a-val',money(curPay)); setText('a-viz-b-val',money(baseCost+(useP2?policyCost:0))); setText('a-viz-c-val',money(bestIncome));
    setText('a-viz-copy','先看現在月付，再看活化後實際月壓力，最後看每月減壓金額。壽險保障金額由你輸入；系統用 PFK 兩年期第六年身故金回推最接近方案，保單增貸利率固定 4%；保留現金會先從投入配息金額中扣除，留在身邊當安全墊。');
  }

  function calcB(){
    var home=num('b-home-value'), currentLoan=num('b-current-loan'), available=home*num('b-ltv')/100-currentLoan;
    var active=num('b-active-amount'), rate=num('b-rate');
    if($('b-drawn')) $('b-drawn').value=active;
    var suggested=active;
    var cost=bMethod==='equal'?pay(active,rate,num('b-years')):interestOnly(active,rate);
    var ins=estimateInsurance(num('b-cover'),'b-ins-age','b-ins-sex','b-fx');
    var reserveWan=num('b-reserve');
    var firstYearPremium=ins.premiumWan/2, secondYearPremium=ins.premiumWan-firstYearPremium;
    var investAmount=Math.max(active-reserveWan-firstYearPremium,0); // 方案二：貸款－預留－PFK首年保費
    var div=estimateDividend(investAmount,'b-fund','b-fx');
    var policyRate=4;
    var income=div.monthly, lifeCost=secondYearPremium*10000*policyRate/100/12, net=income-cost-lifeCost;
    var investP1=Math.max(active-reserveWan-ins.premiumWan,0);
    var divP1=estimateDividend(investP1,'b-fund','b-fx');
    var incomeP1=divP1.monthly, netP1=incomeP1-cost;
    var netDelta=net-netP1;
    var coverRate=active>0?num('b-cover')/active*100:0, activePct=home>0?active/home*100:0, spacePct=available>0?active/available*100:0;
    var activeCost=cost+lifeCost, reserveMonths=activeCost>0?reserveWan*10000/activeCost:0;
    var stressCost=bMethod==='equal'?pay(active,rate+1,num('b-years')):interestOnly(num('b-drawn')||active,rate+1);
    
    setText('b-required',wan(suggested)); setText('b-available',wan(Math.max(available,0))); setText('b-income',money(income)); setText('b-loan-pay',money(cost)); setText('b-life-cost',money(lifeCost)); setText('b-net',money(net)); setText('b-cover-rate',pct(coverRate)); setText('b-cover-cashflow',money(income)); setText('b-cash-pct',pct(activePct)); setText('b-space-pct',pct(spacePct)); setText('b-reserve-months',reserveMonths.toFixed(1)+'月'); setText('b-stress-rate',money(income-stressCost-lifeCost));
    setText('b-live-home',wan(home)); setText('b-live-active',wan(active)); setText('b-live-cost',money(cost)); setText('b-live-invest',wan(investAmount)); setText('b-live-income',money(income)); setText('b-live-life',money(lifeCost)); setText('b-live-premium',wan1(ins.premiumWan));
    setText('b-p1-net',money(netP1)); setText('b-p1-loan-amount',wan(active)); setText('b-p1-cover',wan(num('b-cover'))); setText('b-p1-premium',wan1(ins.premiumWan)); setText('b-p1-income',money(incomeP1)); setText('b-p1-loan',money(cost));
    setText('b-planned-net',money(net)); setText('b-planned-loan-amount',wan(active)); setText('b-planned-cover',wan(num('b-cover'))); setText('b-planned-premium',wan1(firstYearPremium)); setText('b-planned-income',money(income)); setText('b-planned-loan',money(cost)); setText('b-planned-life',money(lifeCost));
    setText('b-baseline-p1',money(netP1)); setText('b-baseline-p2',money(net)); setText('b-baseline-delta',money(netDelta));
    ['b-p1-net','b-planned-net','b-baseline-p1','b-baseline-p2','b-baseline-delta'].forEach(function(id){var val=id.indexOf('p1')>-1?netP1:(id.indexOf('delta')>-1?netDelta:net); var el=$(id); if(el){el.classList.toggle('is-positive',val>0); el.classList.toggle('is-negative',val<0);}});
    setText('home-retire-flow',money(income)); setText('b-lens-income',money(income)); setText('b-lens-cost',money(cost+lifeCost)); setText('b-lens-net',money(net));
    setBar('b-cash-bar',activePct); setBar('b-space-bar',spacePct); setBar('b-reserve-bar',reserveMonths/12*100);
    
    var title=net>0?'方案二：每月可轉出退休現金流':'方案二：目前尚未形成正現金流';
    var fundText=div.fund?fundCode(div.fund.name)+' 依投入額估算年化約 '+div.annualYield.toFixed(2)+'%。':'月配息標的未設定。';
    var insText='PFK兩年期以 '+(ins.sex==='1'?'男性':'女性')+' '+ins.age+' 歲、匯率 '+ins.fx+' 估算，匹配保額 '+ins.sumW+' 萬美元，第六年身故金約 '+wan1(ins.matchedDeathWan)+'，兩年保費約 '+wan1(ins.premiumWan)+'。月配息採 '+fundText;
    var copy=net>0?'資產總值 '+wan(home)+'，安全活化 '+wan(active)+'，扣除保留現金 '+wan(reserveWan)+' 與PFK首年保費 '+wan1(firstYearPremium)+' 後，實際投入V月配息 '+wan(investAmount)+'，預估月配毛流入 '+money(income)+'；第二年保費 '+wan1(secondYearPremium)+' 由保單借款支應，扣除融資成本與借款月息後，每月可安穩淨領 '+money(net)+'。'+insText:'目前架構扣除融資成本與第二年保費借款月息後淨值為 '+money(net)+'。建議調降活化融資總量、優化還款結構或改以理財型息進行靈活比對。'+insText;
    if(active>available && available>0){title='警示：活化總量逾越安全邊際'; copy='融資總額已超過安全成數底線。請務必下修活化比例，確保整體不動產資產的防禦力。'}
    setText('b-decision',title); setText('b-decision-copy',copy); setText('b-judge',bMethod==='wealth'?'理財型循環息機制僅對實質動用計息，極度適合高資產客群進行彈性敏感度對沖。':'本息平均攤還提供高度確定性，適合追求剛性、長期、不變動財務體系之保守規劃。');
    setText('b-client-headline',net>0?'這棟房子每月可轉出 '+money(net)+' 的淨現金流。':'目前每月仍是負現金流，先把成本壓下來。');
    setText('b-client-sub',net>0?'在保留現金與壽險防護後，月配息仍能覆蓋成本並留下餘裕。':'可先降低活化比例、改用理財型計息，或調整月配息標的再比較。');
    
    var maxV=Math.max(income,cost,lifeCost,1);
    setBar('b-viz-income',income/maxV*100); setBar('b-viz-cost',cost/maxV*100); setBar('b-viz-life',lifeCost/maxV*100);
    setText('b-viz-income-val',money(income)); setText('b-viz-cost-val',money(cost)); setText('b-viz-life-val',money(lifeCost));
    setText('b-viz-copy',net>0?'月配息扣除融資成本與保單增貸月息後仍有剩餘。':'目前現金流不足，建議下修活化金額或調整標的。');
  }

  function calcD(){
    var home=num('d-home-value'), currentLoan=num('d-current-loan'), available=home*num('d-ltv')/100-currentLoan;
    var active=num('d-active-amount'), rate=num('d-rate');
    if($('d-drawn')) $('d-drawn').value=active;
    var cost=dMethod==='equal'?pay(active,rate,num('d-years')):interestOnly(active,rate);
    var reserveWan=num('d-reserve');

    var budgetEl=$('d-life-budget'), pctEl=$('d-life-budget-pct');
    var annualTargetWan=num('d-life-budget'), budgetPct=num('d-life-budget-pct');
    if(dLifeBudgetMode==='pct'){
      annualTargetWan=Math.max(active*budgetPct/100,0);
      if(budgetEl) budgetEl.value=(Math.round(annualTargetWan*10)/10).toString();
    }else{
      budgetPct=active>0?annualTargetWan/active*100:0;
      if(pctEl) pctEl.value=(Math.round(budgetPct*10)/10).toString();
    }

    var pfj=pfjFromAnnualBudget(annualTargetWan,'d-ins-age','d-ins-sex','d-fx');
    // 現金流配置採用使用者輸入/比例換算的年預算，不再用保額表反推後的小數保費覆蓋。
    var annualPremium=annualTargetWan;
    var totalPremium=annualPremium*6;
    var hint=$('d-life-budget-hint');
    if(hint) hint.textContent='6 年總預算 '+wan1(totalPremium)+'，第 6 年預估身故金約 '+wan1(pfj.death6Wan)+'。';

    var policyRate=4;

    // 方案一：貸款金額 - 預留金額 - 年預算×6 = 投入月配息金額
    var investP1=Math.max(active-reserveWan-totalPremium,0);
    var divP1=estimateDividend(investP1,'d-fund','d-fx');
    var incomeP1=divP1.monthly;
    var arbitrageP1=incomeP1-cost;

    // 方案二：貸款金額 - 預留金額 - 首年預算 = 投入月配息金額
    var investP2=Math.max(active-reserveWan-annualPremium,0);
    var divP2=estimateDividend(investP2,'d-fund','d-fx');
    var incomeP2=divP2.monthly;
    var yearRows=[];
    for(var y=1;y<=6;y++){
      var borrowedPremium=annualPremium*Math.max(y-1,0);
      var policyInterest=borrowedPremium*10000*policyRate/100/12;
      var arb=incomeP2-cost-policyInterest;
      yearRows.push({year:y,borrowedPremium:borrowedPremium,policyInterest:policyInterest,arbitrage:arb});
    }
    var p2Year1=yearRows[0].arbitrage, p2Year6=yearRows[5].arbitrage;
    var avgP2=yearRows.reduce(function(s,r){return s+r.arbitrage},0)/6;
    var netDelta=p2Year6-arbitrageP1;

    var coverRate=active>0?pfj.death6Wan/active*100:0, activePct=home>0?active/home*100:0, spacePct=available>0?active/available*100:0;
    var activeCost=cost+yearRows[5].policyInterest, reserveMonths=activeCost>0?reserveWan*10000/activeCost:0;
    var stressCost=dMethod==='equal'?pay(active,rate+1,num('d-years')):interestOnly(num('d-drawn')||active,rate+1);

    setText('d-live-home',wan(home)); setText('d-live-active',wan(active)); setText('d-live-cost',money(cost)); setText('d-live-invest',wan1(investP2)); setText('d-live-income',money(incomeP2)); setText('d-live-life',money(yearRows[5].policyInterest)); setText('d-live-premium',wan1(totalPremium));

    setText('d-p1-net',money(arbitrageP1)); setText('d-p1-invest',wan1(investP1)); setText('d-p1-annual',wan1(annualPremium)); setText('d-p1-premium',wan1(totalPremium)); setText('d-p1-sum',usdWan(pfj.sumW)); setText('d-p1-cover',wan1(pfj.death6Wan)); setText('d-p1-income',money(incomeP1)); setText('d-p1-loan',money(cost));
    setText('d-planned-net',money(p2Year6)); setText('d-p2-invest',wan1(investP2)); setText('d-planned-annual',wan1(annualPremium)); setText('d-planned-sum',usdWan(pfj.sumW)); setText('d-planned-cover',wan1(pfj.death6Wan)); setText('d-planned-income',money(incomeP2)); setText('d-planned-loan',money(cost)); setText('d-planned-life',money(yearRows[5].policyInterest));
    setText('d-baseline-p1',money(arbitrageP1)); setText('d-baseline-p2',money(p2Year1)); setText('d-baseline-delta',money(p2Year6));
    ['d-p1-net','d-planned-net','d-baseline-p1','d-baseline-p2','d-baseline-delta'].forEach(function(id){var val=id==='d-p1-net'||id==='d-baseline-p1'?arbitrageP1:(id==='d-baseline-p2'?p2Year1:p2Year6); var el=$(id); if(el){el.classList.toggle('is-positive',val>0); el.classList.toggle('is-negative',val<0);}});
    setText('d-lens-income',money(incomeP2)); setText('d-lens-cost',money(cost+yearRows[5].policyInterest)); setText('d-lens-net',money(p2Year6));

    var body=$('d-pfj-flow-body');
    if(body){
      body.innerHTML='';
      yearRows.forEach(function(r){
        var tr=document.createElement('tr');
        tr.innerHTML='<td>第 '+r.year+' 年</td><td>'+money(incomeP2)+'</td><td>'+wan1(r.borrowedPremium)+'</td><td>'+money(cost)+'</td><td>'+money(r.policyInterest)+'</td><td class="'+(r.arbitrage>=0?'pos':'neg')+'">'+money(r.arbitrage)+'</td>';
        body.appendChild(tr);
      });
    }
    var better=p2Year6>=arbitrageP1?'方案二':'方案一';
    var title='傳承安家：'+better+'較有利';
    var fundText=divP2.fund?fundCode(divP2.fund.name)+' 依投入額估算年化約 '+divP2.annualYield.toFixed(2)+'%。':'月配息標的未設定。';
    var lifeText='壽險以 '+(pfj.sex==='1'?'男性':'女性')+' '+pfj.age+' 歲、匯率 '+pfj.fx+' 估算，年預算 '+wan1(annualPremium)+'，6 年總預算 '+wan1(totalPremium)+'，保額 '+pfj.sumW+' 萬美元，第 6 年身故金約 '+wan1(pfj.death6Wan)+'。';
    var copy='方案一先預留 6 年壽險預算，投入配息本金約 '+wan1(investP1)+'，月套利約 '+money(arbitrageP1)+'。方案二只先預留首年預算，投入配息本金約 '+wan1(investP2)+'；第 1 年月套利約 '+money(p2Year1)+'，第 6 年扣除 5 份保單借款月息後約 '+money(p2Year6)+'，6 年平均約 '+money(avgP2)+'。'+lifeText+'月配息採 '+fundText;
    if(active>available && available>0){title='警示：活化總量逾越安全邊際'; copy='融資總額已超過安全成數底線。請務必下修活化比例，確保整體不動產資產的防禦力。'+lifeText;}
    setText('d-client-headline',better+'：第 6 年月套利約 '+money(better==='方案二'?p2Year6:arbitrageP1)+'。');
    setText('d-client-sub','壽險年預算 '+wan1(annualPremium)+'，第 6 年身故金約 '+wan1(pfj.death6Wan)+'；可比較穩健預留與效率借款兩種路徑。');

  }

  function calcC(){
    var amount=num('c-amount'), rate=num('c-rate'), years=num('c-years'), grace=num('c-grace'), drawn=num('c-drawn')||amount;
    grace=clamp(grace,0,Math.max(years-1,0));
    var primary, interest,total,firstPrincipal,gracePay=interestOnly(amount,rate);
    if(cMethod==='wealth'){
      primary=interestOnly(drawn,rate); interest=primary*12; total=drawn*10000; firstPrincipal=0; setText('c-primary-label','實質動用月利息支出'); setText('c-caption','理財型循環機制：在核定總額度內隨借隨還，僅針對每日實質動用餘額計息，本金到期整體清償。');
    }else{
      var amortYears=Math.max(years-grace,1); primary=pay(amount,rate,amortYears); if(grace>0){interest=gracePay*grace*12+(primary*amortYears*12-amount*10000)}else{interest=primary*years*12-amount*10000} total=amount*10000+interest; firstPrincipal=grace>0?0:Math.max(primary-interestOnly(amount,rate),0); setText('c-primary-label','每月固定攤還本息和'); setText('c-caption',grace>0?'本息平均攤還含寬限期：寬限期內每月僅付利息、不還本金；期滿後才進入固定本息攤還。':'本息平均攤還：每月支付固定金額。前期因本金基數大，名目利息佔比相對較高，後續逐月遞減。');
    }
    setText('c-primary',money(primary)); setText('c-interest',money(interest)); setText('c-total',money(total)); setText('c-first-principal',money(firstPrincipal)); setText('c-grace-pay',money(gracePay)); renderSchedule(amount,rate,years,grace,cMethod);
    
  }

  function renderSchedule(amount,rate,years,grace,method){
    var body=$('c-schedule'); body.innerHTML=''; 
    grace=clamp(grace,0,Math.max(years-1,0));
    if(method==='wealth'){
      body.innerHTML='<tr><td>每年度平均</td><td>$0</td><td>'+money(interestOnly(num('c-drawn')||amount,rate)*12)+'</td><td>'+money(interestOnly(num('c-drawn')||amount,rate)*12)+'</td><td>'+money((num('c-drawn')||amount)*10000)+'</td></tr>'; 
      return;
    }
    var balance=amount*10000, r=rate/100/12, amortYears=Math.max(years-grace,1), monthly=pay(amount,rate,amortYears); 
    for(var y=1;y<=years;y++){
      var yp=0,yi=0,ypay=0; 
      for(var m=1;m<=12;m++){
        if(y<=grace){var int=balance*r; yi+=int; ypay+=int;}
        else{var int2=balance*r; var prin=Math.min(monthly-int2,balance); yi+=int2; yp+=prin; ypay+=monthly; balance-=prin; if(balance<1) balance=0;}
      }
      var tr=document.createElement('tr'); 
      tr.innerHTML='<td>第 '+y+' 年度</td><td>'+money(yp)+'</td><td>'+money(yi)+'</td><td>'+money(ypay)+'</td><td>'+money(balance)+'</td>'; 
      body.appendChild(tr); 
      if(balance<=0) break;
    }
  }

  function copyToClipboard(text){
    if(navigator.clipboard && navigator.clipboard.writeText){navigator.clipboard.writeText(text).then(showToast).catch(function(){fallbackCopy(text)});}else fallbackCopy(text);
  }
  function fallbackCopy(text){var ta=document.createElement('textarea');ta.value=text;document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove();showToast();}
  function showToast(){var toast=$('copyToast'); if(!toast) return; toast.classList.add('show'); setTimeout(function(){toast.classList.remove('show')},1600);}
  function calcAll(){if(current==='toolA'||current==='home'||current==='conceptA')calcA(); if(current==='toolB'||current==='home'||current==='conceptB')calcB(); if(current==='toolD'||current==='home'||current==='conceptD')calcD(); if(current==='calculator'||current==='home')calcC();}

  var ph=$('portraitHint'), pc=$('portraitClose'); if(pc){pc.onclick=function(){ph&&ph.classList.add('dismissed')}};
  var toast=document.createElement('div'); toast.id='copyToast'; toast.className='copy-toast'; toast.textContent='已成功複製規劃結論至剪貼簿'; document.body.appendChild(toast);
  var ac=$('a-copy-summary'); if(ac){ac.onclick=function(){copyToClipboard('房產現金流OS【房貸減壓方案】\n方案一：活化後月付 '+($('a-p1-d')?$('a-p1-d').textContent:'')+'，每月減壓 '+($('a-p1-relief')?$('a-p1-relief').textContent:'')+'。\n方案二：活化後月付 '+($('a-p2-d')?$('a-p2-d').textContent:'')+'，每月減壓 '+($('a-p2-relief')?$('a-p2-relief').textContent:'')+'。\n結構：'+($('a-judge')?$('a-judge').textContent:''))}}
  var bc=$('b-copy-summary'); if(bc){bc.onclick=function(){copyToClipboard('房產現金流OS【ROUTE B 面談結論】\n判讀：'+$('b-decision').textContent+'\n結論：'+$('b-decision-copy').textContent+'\n規劃：'+$('b-judge').textContent)}}

  var dc=$('d-copy-summary'); if(dc){dc.onclick=function(){copyToClipboard('房產現金流OS【傳承安家】\n方案一月套利：'+(($('d-p1-net')||{}).textContent||'')+'\n方案二第6年月套利：'+(($('d-planned-net')||{}).textContent||'')+'\n方案一投入本金：'+(($('d-p1-invest')||{}).textContent||'')+'\n方案二投入本金：'+(($('d-p2-invest')||{}).textContent||''))}}

  populateFundSelects(); syncFxFields(); updateDividendNotes();
  toggleMethods(); calcAll(); refreshMarket();
})();
