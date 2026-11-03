// ============================================================
// Main application logic — originally at lines 5830-7201
// ============================================================

// ===== STATE =====
let u = { nickname:'', age:0, gender:'M', retire:60, income:0 };
let exp = {};
let baselineExp = null;
let baselineProfile = null;
let baselineSummary = null;
let currentSummary = null;
let currentStep = 0;

// ===== NAVIGATION =====
function goStep(n) {
    document.body.setAttribute('data-step', String(n));
    document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
    document.getElementById('step' + n).classList.add('active');
    currentStep = n;
    updateProgress();
    window.scrollTo({top:0, behavior:'smooth'});
}

function updateProgress() {
    // 7頁：0=說明, 1=基本資料, 2=理想生活, 3=理想目標+修正, 4=比較差距, 5=收入結構, 6=解決方案
    const pct = [0, 17, 33, 50, 67, 83, 100][currentStep] || 0;
    document.getElementById('progressFill').style.width = pct + '%';
    const labels = ['', '步驟 1/6：基本資料', '步驟 2/6：理想生活', '步驟 3/6：理想目標', '步驟 4/6：差距比較', '步驟 5/6：收入結構', '步驟 6/6：解決方案'];
    document.getElementById('progressLabel').textContent = labels[currentStep] || '';
}

// ===== GENDER =====
function setGender(g) {
    u.gender = g;
    document.getElementById('gb-M').classList.toggle('active', g==='M');
    document.getElementById('gb-F').classList.toggle('active', g==='F');
}

// ===== STEP 1 VALIDATION =====
function step1Next() {
    const nick = document.getElementById('f-nickname').value.trim();
    const age  = parseInt(document.getElementById('f-age').value);
    const ret  = Number(document.getElementById('f-retire').value);
    const inc  = parseFloat(document.getElementById('f-income').value);

    if (!nick)              return alert('請輸入暱稱');
    if (!age||age<18||age>70) return alert('請輸入正確年齡（18-70歲）');
    if (!Number.isInteger(ret)||ret<40||ret>80||ret<=age) return alert('退休年齡須為40–80歲，且大於目前年齡');
    if (!inc||inc<=0)       return alert('請輸入每月收入');

    u.nickname = nick;
    u.age = age;
    u.retire = ret;
    u.income = inc;

    // Pre-fill modal read-only fields
    const mrYears = document.getElementById('mr-years-display');
    if (mrYears) mrYears.value = (85 - ret) + ' 年';

    goStep(2);
    updateLiveSummary();
}

// Retirement is a shared planning input. Baseline data remains immutable.
function validRetirementAge(value, age=u.age) {
    const n=Number(value);
    return Number.isInteger(n)&&n>=40&&n<=80&&n>Number(age);
}
function refreshAgeDerivedExpenses(source=exp, profile=u) {
    const workYears=profile.retire-profile.age, retiredYears=85-profile.retire;
    const retirement=source.retirement;
    if(retirement && retirement.data && workYears>0) computeRetirement(source, profile);
    if(source.living?.amount>0) source.living.label=`每月${source.living.amount.toFixed(2)}萬｜到退休前 ${workYears} 年共 ${(source.living.amount*12*workYears).toFixed(0)} 萬`;
    if(source.emergency?.amount>0) source.emergency.label=`平均每月${source.emergency.amount.toFixed(2)}萬｜到退休前 ${workYears} 年共 ${(source.emergency.amount*12*workYears).toFixed(0)} 萬`;
    return source;
}
// 房貸年限與 saveModal('house') 的 30 年房貸試算一致
const MORTGAGE_YEARS = 30;
// 退休後居住支出：購屋只算到房貸繳清；租屋與自訂金額視為整段退休期都要負擔
function retirementHousing(source, profile, data) {
    const retiredYears = Math.max(85 - profile.retire, 0);
    if (!data || data.housingMode === 'stop') return { monthly: 0, years: 0, note: '' };
    if (data.housingMode === 'custom') {
        const monthly = inputYuanToWan(data.housingCustom);
        return { monthly, years: monthly > 0 ? retiredYears : 0, note: monthly > 0 ? '自訂居住支出' : '' };
    }
    const house = source.house;
    const monthly = house?.amount || 0;
    if (!monthly) return { monthly: 0, years: 0, note: '' };
    if (house.ownership === 'buy') {
        const payoffAge = (house.startAge ?? profile.age) + MORTGAGE_YEARS;
        const years = Math.min(Math.max(payoffAge - profile.retire, 0), retiredYears);
        return { monthly, years, payoffAge, note: years > 0 ? `房貸繳到 ${payoffAge} 歲` : `房貸 ${payoffAge} 歲前繳清` };
    }
    return { monthly, years: retiredYears, note: '退休後持續付房租' };
}
// 退休總需求＝（生活支出 × 退休年數 ＋ 居住支出 × 實際負擔年數）× 12
function computeRetirement(source, profile) {
    const r = source.retirement;
    if (!r || !r.data) return r;
    const d = r.data;
    const workYears = Math.max(profile.retire - profile.age, 1);
    const retiredYears = Math.max(85 - profile.retire, 0);
    const base = (d.life || 0) + (d.fun || 0) + (d.travel || 0) + (d.care || 0);
    const h = retirementHousing(source, profile, d);
    // 房貸不計入退休金：退休後仍在繳的房貸只做提醒、需另行規劃；房租與自訂居住支出仍算退休生活費
    const isMortgage = d.housingMode !== 'custom' && source.house?.ownership === 'buy';
    const housingActive = h.years > 0 && !isMortgage ? h.monthly : 0;
    // 保留繳清年齡：快速試算／完整規劃改了退休年齡時，提醒可依新的退休年齡重算
    r.mortgageAfterRetire = isMortgage && h.payoffAge ? { monthly: h.monthly, years: h.years, payoffAge: h.payoffAge } : null;
    r.baseMonthly = base;
    r.housingMonthly = housingActive;
    r.housingYears = housingActive > 0 ? h.years : 0;
    r.housingNote = housingActive > 0 ? h.note : '';
    r.targetMonthly = base + housingActive;
    r.targetTotal = (base * retiredYears + housingActive * h.years) * 12;
    r.amount = r.targetTotal / (workYears * 12);
    // 房貸在退休期間中途繳清時分兩段寫，避免被誤用「每月支出 × 12 × 退休年數」來驗算
    const monthlyText = housingActive > 0 && h.years < retiredYears
        ? `退休後前 ${h.years} 年每月${r.targetMonthly.toFixed(2)}萬（含房貸${housingActive.toFixed(2)}萬），之後每月${base.toFixed(2)}萬`
        : `退休後每月${r.targetMonthly.toFixed(2)}萬`;
    r.label = `${monthlyText}｜退休 ${retiredYears} 年需 ${r.targetTotal.toFixed(0)} 萬｜退休前 ${workYears} 年每月準備 ${r.amount.toFixed(2)} 萬`
        + (r.mortgageAfterRetire?.years > 0 ? `｜退休後房貸 ${r.mortgageAfterRetire.years} 年未計入` : '');
    return r;
}
// 退休後仍在繳的房貸提醒（不計入退休金）；retireAge 有給時依該退休年齡重算剩餘年數
function mortgageReminderText(r, retireAge) {
    const m = r && r.mortgageAfterRetire;
    if (!m) return '';
    const years = retireAge ? m.payoffAge - retireAge : m.years;
    if (!(years > 0)) return '';
    return `退休後房貸還要繳 ${years} 年（每月 ${Math.round(m.monthly * 10000).toLocaleString('zh-TW')} 元，繳到 ${m.payoffAge} 歲），未計入退休金，需另行規劃`;
}
// 退休後平均每月支出（元）：房貸只在繳清前計入，攤平到整段退休期，供月配息規劃使用
function retirementMonthlyAverageYuan(source=exp, profile=u) {
    const r = source.retirement;
    if (!r || !(r.targetMonthly > 0)) return 0;
    const retiredYears = Math.max(85 - profile.retire, 0);
    const wan = retiredYears > 0 && r.targetTotal > 0 ? r.targetTotal / (12 * retiredYears) : r.targetMonthly;
    return Math.round(wan * 10000);
}
// 收入來源：工作（第五頁可覆寫）＋ 斜槓 ＋ 投資（本金年化 7% ＋ 手動）
function getIncomeBreakdown() {
    const val = id => parseFloat(document.getElementById(id)?.value) || 0;
    const workOverride = val('inc-work-input');
    const work = workOverride > 0 ? workOverride : Math.round((u.income || 0) * 10000);
    const slash = (typeof slashItems !== 'undefined' ? slashItems : []).reduce((s, item) => s + (Number(item.amount) || 0), 0);
    const principal = val('inc-invest-principal');
    const invest = Math.round(principal * 0.07 / 12) + val('inc-invest-input');
    return { work, slash, invest, principal, total: work + slash + invest };
}
function syncRetirementAge(value, render=true) {
    if(!validRetirementAge(value)) return false;
    u.retire=Number(value);
    ['f-retire','r-retire-age','mr-retire','s6y-retire','s6n-retire'].forEach(id=>{const el=document.getElementById(id);if(el)el.value=u.retire;});
    const years=document.getElementById('mr-years-display');if(years)years.value=(85-u.retire)+' 年';
    refreshAgeDerivedExpenses();
    baselineSummary=baselineExp?summarizeExp(baselineExp):null;
    currentSummary=summarizeExp(exp);
    if(typeof RS!=='undefined') {RS.retirementAge=u.retire;RS.currentAge=u.age;}
    if(exp.retirement)markFilled('retirement',exp.retirement.amount);
    const error=document.getElementById('r-retire-error');if(error)error.textContent='';
    if(render && currentStep===3)calcResults(false);
    return true;
}
function applyRevisionRetirementAge() {
    const value=document.getElementById('r-retire-age').value;
    if(!syncRetirementAge(value)) {
        document.getElementById('r-retire-error').textContent=`請輸入${Math.max(40,u.age+1)}–80歲的整數`;
        return false;
    }
    return true;
}
function previewRetirementAge() {
    const value=document.getElementById('mr-retire').value;
    document.getElementById('mr-years-display').value=validRetirementAge(value)?(85-Number(value))+' 年':'請確認退休年齡';
}

// ===== MODAL HELPERS =====
function openModal(cat) {
    document.getElementById('m-' + cat).classList.add('open');
    if (cat === 'retirement') {
        document.getElementById('mr-retire').value=u.retire;
        document.getElementById('mr-retire').min=Math.max(40,u.age+1);
        previewRetirementAge();
        onRetirementHousingChange();
    }

    // 根據當前步驟顯示或隱藏 "不要" 按鈕：只有在結果頁修正時（步驟≥3）才顯示
    const skipBtn = document.querySelector('#m-' + cat + ' .skip-btn');
    if (skipBtn) {
        // currentStep 全局變數，步驟 3 為結果頁
        skipBtn.style.display = (currentStep >= 3 ? 'inline-block' : 'none');
    }
}
function closeModal(cat) {
    document.getElementById('m-' + cat).classList.remove('open');
}

// Close on overlay click
document.querySelectorAll('.modal-overlay').forEach(el => {
    el.addEventListener('click', function(e) {
        if (e.target === this) this.classList.remove('open');
    });
});

// Type handlers
const HOUSE_BUDGETS = {
    buy: {
        apartment_elevator: [
            { value: 2500, label: '入門總價（2,500萬）' },
            { value: 3500, label: '主流總價（3,500萬）' },
            { value: 4500, label: '高階總價（4,500萬）' }
        ],
        townhouse_suburb: [
            { value: 1800, label: '入門總價（1,800萬）' },
            { value: 2400, label: '主流總價（2,400萬）' },
            { value: 3000, label: '高階總價（3,000萬）' }
        ],
        apartment_walkup: [
            { value: 800, label: '入門總價（800萬）' },
            { value: 1100, label: '主流總價（1,100萬）' },
            { value: 1500, label: '高階總價（1,500萬）' }
        ],
        studio_personal: [
            { value: 600, label: '入門總價（600萬）' },
            { value: 900, label: '主流總價（900萬）' },
            { value: 1200, label: '高階總價（1,200萬）' }
        ]
    },
    rent: {
        apartment_elevator: [
            { value: 2.5, label: '月租入門（2.5萬 / 月）' },
            { value: 3.2, label: '月租主流（3.2萬 / 月）' },
            { value: 4, label: '月租高階（4萬 / 月）' }
        ],
        townhouse_suburb: [
            { value: 2, label: '月租入門（2萬 / 月）' },
            { value: 2.5, label: '月租主流（2.5萬 / 月）' },
            { value: 3, label: '月租高階（3萬 / 月）' }
        ],
        apartment_walkup: [
            { value: 1.5, label: '月租入門（1.5萬 / 月）' },
            { value: 2, label: '月租主流（2萬 / 月）' },
            { value: 2.5, label: '月租高階（2.5萬 / 月）' }
        ],
        studio_personal: [
            { value: 1, label: '月租入門（1萬 / 月）' },
            { value: 1.4, label: '月租主流（1.4萬 / 月）' },
            { value: 1.8, label: '月租高階（1.8萬 / 月）' }
        ]
    }
};

function calculateMonthlyPayment(principalWan, annualRate=0.02, years=30) {
    const monthlyRate = annualRate / 12;
    const months = years * 12;
    if (monthlyRate === 0) return principalWan / months;
    const factor = Math.pow(1 + monthlyRate, months);
    return principalWan * (monthlyRate * factor) / (factor - 1);
}

function onHouseOptionChange() {
    const ownership = document.getElementById('mh-ownership').value;
    const type = document.getElementById('mh-type').value;
    const budgetEl = document.getElementById('mh-budget');
    const hintEl = document.getElementById('mh-budget-hint');
    const customUnit = document.getElementById('mh-custom-unit');
    const customHint = document.getElementById('mh-custom-hint');

    toggle('mh-recommend-wrap', !!(ownership && type));
    toggle('mh-custom-wrap', false);
    document.getElementById('mh-custom').value = '';

    customUnit.textContent = ownership === 'rent' ? '元 / 月' : '萬元';
    customHint.textContent = ownership === 'rent'
        ? '租屋請直接輸入每月租金。'
        : '購屋請輸入房屋總價，系統會自動換算頭款 2 成、貸款 8 成、30 年房貸月付。';

    if (!(ownership && type)) {
        budgetEl.innerHTML = '<option value="">請先選擇擁有方式與住宅類型</option>';
        hintEl.textContent = '系統會依照雙北常見行情幫你帶出推薦金額';
        return;
    }

    const options = HOUSE_BUDGETS[ownership][type] || [];
    budgetEl.innerHTML = '<option value="">請選擇建議金額</option>'
        + options.map(item => `<option value="${item.value}">${item.label}</option>`).join('')
        + '<option value="custom">自訂金額</option>';

    hintEl.textContent = ownership === 'buy'
        ? '購屋固定頭款 2 成、貸款 8 成，並以 30 年房貸、年利率 2% 換算月付。'
        : '租屋直接以每月租金計入現金流。';
}

function onHouseBudgetChange() {
    const val = document.getElementById('mh-budget').value;
    toggle('mh-custom-wrap', val === 'custom');
}

function onCarType()      { toggle('mc-custom-wrap', document.getElementById('mc-type').value==='custom'); }
function onFuelChange()    { toggle('mc-fuel-custom-wrap', document.getElementById('mc-fuel').value==='custom'); }
function onParkingChange() { toggle('mc-parking-custom-wrap', document.getElementById('mc-parking').value==='custom'); }
function onWeddingSelectChange(selectId, wrapId) { toggle(wrapId, document.getElementById(selectId).value==='custom'); }
function onChildrenType() { toggle('mk-custom-wrap', document.getElementById('mk-type').value==='custom'); }
function onMedicalType()  { toggle('mm-custom-wrap', document.getElementById('mm-type').value==='custom'); }
function onEmergencyType(){ toggle('me-custom-wrap', document.getElementById('me-type').value==='custom'); }
function onRetirementSelectChange(selectId, wrapId) { toggle(wrapId, document.getElementById(selectId).value==='custom'); }
function onRetirementHousingChange() {
    const mode = document.getElementById('mr-housing-mode').value;
    toggle('mr-housing-custom-wrap', mode === 'custom');
    const hint = document.getElementById('mr-housing-link-hint');
    if (mode === 'link') {
        if (exp.house && exp.house.amount > 0) {
            hint.textContent = exp.house.ownership === 'buy'
                ? '目前房貸 ' + exp.house.amount.toFixed(2) + ' 萬 / 月，只計算到房貸繳清（' + ((exp.house.startAge ?? u.age) + MORTGAGE_YEARS) + ' 歲）。'
                : '目前房租 ' + exp.house.amount.toFixed(2) + ' 萬 / 月，退休後持續計算。';
        } else {
            hint.textContent = '前面尚未填房子，若保留此選項會視為 0。';
        }
    } else if (mode === 'stop') {
        hint.textContent = '退休後視為房貸已繳完或不用再租屋。';
    } else {
        hint.textContent = '可自訂退休後仍需負擔的房貸或租金。';
    }
}
function toggle(id, show) { document.getElementById(id).style.display = show?'block':'none'; }

// ===== SAVE MODAL =====
function saveModal(cat) {
    let amount = 0, label = '', choice = '';

    switch(cat) {
        case 'house': {
            const ownership = document.getElementById('mh-ownership').value;
            const type = document.getElementById('mh-type').value;
            const budget = document.getElementById('mh-budget').value;
            if (!ownership) return alert('請選擇擁有方式');
            if (!type) return alert('請選擇住宅類型');
            if (!budget) return alert('請選擇建議預算');

            let baseAmount;
            if (budget === 'custom') {
                baseAmount = +document.getElementById('mh-custom').value;
                if (!baseAmount) return alert('請輸入金額');
            } else {
                baseAmount = +budget;
            }

            choice = `🏠 房子｜${selText('mh-type')}`;
            if (ownership === 'buy') {
                const loanPrincipal = baseAmount * 0.8;
                const monthlyPayment = calculateMonthlyPayment(loanPrincipal, 0.02, 30);
                amount = monthlyPayment;
                label = `總價${baseAmount}萬｜頭款${(baseAmount*0.2).toFixed(0)}萬｜30年房貸月付約${monthlyPayment.toFixed(2)}萬`;
            } else {
                amount = baseAmount;
                label = `月租約${baseAmount.toFixed(2)}萬`;
            }
            break;
        }
        case 'car': {
            const t = document.getElementById('mc-type').value;
            if (!t) return alert('請選擇車子類型');
            const fuelRaw = document.getElementById('mc-fuel').value;
            const parkingRaw = document.getElementById('mc-parking').value;
            const fuel = fuelRaw === 'custom' ? inputYuanToWan(document.getElementById('mc-fuel-custom').value) : (+fuelRaw || 0);
            const parking = parkingRaw === 'custom' ? inputYuanToWan(document.getElementById('mc-parking-custom').value) : (+parkingRaw || 0);
            let loan = 0;
            let price = 0;
            let typeText = '';
            if (t === 'custom') {
                price = +document.getElementById('mc-custom').value;
                if (!price) return alert('請輸入車價');
                typeText = '自訂車款';
            } else {
                price = +t;
                typeText = selText('mc-type').replace(/（.*?）/g, '').trim();
            }
            if (price > 0) {
                loan = calculateMonthlyPayment(price * 0.8, 0.03, 7);
            }
            amount = loan + fuel + parking;
            choice = `🚗 車子｜${price > 0 ? typeText + (parking > 0 ? '+車位' : '') : '目前不買車'}`;
            label = price > 0
                ? `車價${price}萬｜7年車貸約${loan.toFixed(2)}萬 + 油電${fuel.toFixed(2)}萬 + 車位${parking.toFixed(2)}萬`
                : `油電${fuel.toFixed(2)}萬 + 車位${parking.toFixed(2)}萬`;
            break;
        }
        case 'wedding': {
            const utilityRaw = document.getElementById('mw-utility').value;
            const networkRaw = document.getElementById('mw-network').value;
            const homeRaw = document.getElementById('mw-home').value;
            const foodRaw = document.getElementById('mw-food').value;
            const utility = utilityRaw === 'custom' ? inputYuanToWan(document.getElementById('mw-utility-custom').value) : (+utilityRaw || 0);
            const network = networkRaw === 'custom' ? inputYuanToWan(document.getElementById('mw-network-custom').value) : (+networkRaw || 0);
            const home = homeRaw === 'custom' ? inputYuanToWan(document.getElementById('mw-home-custom').value) : (+homeRaw || 0);
            const food = foodRaw === 'custom' ? inputYuanToWan(document.getElementById('mw-food-custom').value) : (+foodRaw || 0);
            amount = utility + network + home + food;
            if (amount <= 0) return alert('請至少設定一項家庭開銷');
            choice = '🏡 家庭開銷｜日常家用';
            label = `水電瓦斯${utility.toFixed(2)}萬 + 網路第四台${network.toFixed(2)}萬 + 家庭用品${home.toFixed(2)}萬 + 伙食外食${food.toFixed(2)}萬`;
            exp[cat] = { amount, label, data: { utilityRaw, utilityCustom: utilityRaw === 'custom' ? utility : '', networkRaw, networkCustom: networkRaw === 'custom' ? network : '', homeRaw, homeCustom: homeRaw === 'custom' ? home : '', foodRaw, foodCustom: foodRaw === 'custom' ? food : '' } };
            markFilled(cat, amount);
            closeModal(cat);
            updateLiveSummary();
            if (currentStep === 3) calcResults(false);
            return;
        }
        case 'children': {
            const cnt = +document.getElementById('mk-count').value || 0;
            const t = document.getElementById('mk-type').value;
            let unit;
            if (t === 'custom') {
                unit = inputYuanToWan(document.getElementById('mk-custom').value);
                if (!unit && cnt > 0) return alert('請輸入金額');
                choice = '👶 小孩｜自訂養育版本';
            } else {
                unit = +t;
                choice = `👶 小孩｜${selText('mk-type').replace(/（.*?）/g, '').trim()}`;
            }
            amount = cnt * unit;
            label = `${cnt}位孩子 × 每月${unit.toFixed(2)}萬`;
            break;
        }
        case 'parents': {
            const mo = +document.getElementById('mp-monthly').value;
            const care = +document.getElementById('mp-care').value || 0;
            if (!mo && !care) return alert('請至少輸入孝親費或照護支出');
            amount = mo + care;
            choice = '👴 孝養父母｜孝親費＋照護';
            label = `孝親費${mo.toFixed(2)}萬 + 照護${care.toFixed(2)}萬`;
            exp[cat] = { amount, label, data: { monthly: mo, care } };
            markFilled(cat, amount);
            closeModal(cat);
            updateLiveSummary();
            if (currentStep === 3) calcResults(false);
            return;
        }
        case 'retirement': {
            const life = +document.getElementById('mr-monthly').value;
            if (!life || life <= 0) return alert('請輸入退休後每月生活費');
            if(!syncRetirementAge(document.getElementById('mr-retire').value,false)) return alert('退休年齡須為40–80歲，且大於目前年齡');
            choice = '🏖️ 退休準備｜退休生活';
            break;
        }
        case 'medical': {
            const t = document.getElementById('mm-type').value;
            let monthly;
            if (t === 'custom') {
                monthly = inputYuanToWan(document.getElementById('mm-custom').value);
                if (!monthly) return alert('請輸入金額');
                choice = '🏥 醫療 / 保險｜自訂配置';
            } else {
                monthly = +t;
                choice = `🏥 醫療 / 保險｜${selText('mm-type').replace(/（.*?）/g, '').trim()}`;
            }
            amount = monthly;
            label = `醫療 / 保險每月${monthly.toFixed(2)}萬`;
            exp[cat] = { amount, label, data: { type: t, custom: t === 'custom' ? monthly : '' } };
            markFilled(cat, amount);
            closeModal(cat);
            updateLiveSummary();
            if (currentStep === 3) calcResults(false);
            return;
        }
        case 'emergency': {
            const t = document.getElementById('me-type').value;
            if (!t) return alert('請選擇旅遊預算');
            if (t === '0') { amount = 0; choice = '✈️ 旅行｜目前不安排'; label = '不旅遊'; break; }
            let yearly;
            let typeText = '';
            if (t === 'custom') {
                yearly = +document.getElementById('me-custom').value;
                if (!yearly) return alert('請輸入金額');
                typeText = '自訂旅遊';
            } else {
                yearly = +t;
                typeText = selText('me-type').replace(/（.*?）/g, '').trim();
            }
            const yearsToRetire = Math.max(u.retire - u.age, 0);
            amount = yearly / 12;
            choice = `✈️ 旅行｜${typeText}`;
            label = `平均每月${amount.toFixed(2)}萬｜到退休前 ${yearsToRetire} 年共 ${(yearly * yearsToRetire).toFixed(0)} 萬`;
            break;
        }
        case 'living': {
            const mo = +document.getElementById('ml-monthly').value;
            if (!mo || mo <= 0) return alert('請輸入每月生活費');
            const yearsToRetire = Math.max(u.retire - u.age, 0);
            amount = mo;
            choice = '💰 每月生活費｜個人日常開銷';
            label = `每月${mo.toFixed(2)}萬｜到退休前 ${yearsToRetire} 年共 ${(mo * 12 * yearsToRetire).toFixed(0)} 萬`;
            break;
        }
        case 'other': {
            const name = document.getElementById('mo-name').value.trim();
            amount = +document.getElementById('mo-amount').value;
            if (!amount) return alert('請輸入金額');
            choice = `🎁 其他｜${name || '其他項目'}`;
            label = `每月${amount.toFixed(2)}萬`;
            break;
        }
    }

    exp[cat] = { amount, label, choice };
    if (cat === 'house') {
        exp.house.ownership = document.getElementById('mh-ownership').value;
        exp.house.startAge = u.age;
    }
    if (cat === 'retirement') {
        const raw = id => document.getElementById(id).value;
        const pick = (selectId, customId) => raw(selectId) === 'custom' ? inputYuanToWan(raw(customId)) : (+raw(selectId) || 0);
        exp[cat].data = {
            life: +raw('mr-monthly') || 0, housingMode: raw('mr-housing-mode'), housingCustom: raw('mr-housing-custom'),
            fun: pick('mr-fun', 'mr-fun-custom'), travel: pick('mr-travel', 'mr-travel-custom'), care: pick('mr-care', 'mr-care-custom'),
            funRaw: raw('mr-fun'), travelRaw: raw('mr-travel'), careRaw: raw('mr-care'),
            funCustom: raw('mr-fun-custom'), travelCustom: raw('mr-travel-custom'), careCustom: raw('mr-care-custom')
        };
        computeRetirement(exp, u);
        amount = exp[cat].amount;
    }
    if (cat === 'house' && exp.retirement?.data) {
        computeRetirement(exp, u);
        markFilled('retirement', exp.retirement.amount);
    }
    markFilled(cat, amount);
    closeModal(cat);
    updateLiveSummary();
    if (currentStep === 3) calcResults(false);
}

// 新增 skipCategory 函式：允許在修正時直接放棄某個類別
function skipCategory(cat) {
    // 將該分類的支出重置為 0 並標記已跳過
    exp[cat] = { amount: 0, label: '', choice: '' };
    markFilled(cat, 0);
    closeModal(cat);
    updateLiveSummary();
    if (currentStep === 3) {
        // 若在結果頁修正時呼叫，重新計算結果
        calcResults(false);
    }
}

function selText(id) {
    const el = document.getElementById(id);
    return el.options[el.selectedIndex].text;
}

function markFilled(cat, amount) {
    const ci = document.getElementById('ci-' + cat);
    const ca = document.getElementById('ca-' + cat);
    ci.classList.add('filled');
    ca.textContent = amount > 0 ? fmtAmt(amount) + '/月' : '已跳過';
    if (!ci.querySelector('.check-badge')) {
        const b = document.createElement('div');
        b.className = 'check-badge'; b.textContent = '✓';
        ci.appendChild(b);
    }
}


function wanToYuan(n) {
    return Math.round((Number(n) || 0) * 10000);
}

function inputYuanToWan(v) {
    return (Number(v) || 0) / 10000;
}

function formatWanDetailToYuanText(n) {
    return wanToYuan(n).toLocaleString() + ' 元';
}

function formatYuanFromWan(n) {
    return wanToYuan(n).toLocaleString() + ' 元';
}

function formatYuanPerMonthFromWan(n) {
    return wanToYuan(n).toLocaleString() + ' 元 / 月';
}

function fmtAmt(n) {
    return formatYuanFromWan(n);
}


function getCurrentNeed() {
    let total = 0;
    Object.values(exp).forEach(v => {
        if (v && v.amount > 0) total += v.amount;
    });
    return total;
}

function updateLiveSummary() {
    refreshAgeDerivedExpenses();
    const incomeEl = document.getElementById('liveIncome');
    const needEl = document.getElementById('liveNeed');
    const gapTextEl = document.getElementById('liveGapText');
    if (!incomeEl || !needEl || !gapTextEl) return;
    const income = u.income || 0;
    const filled = Object.values(exp).filter(v => v && ((v.amount || 0) > 0 || (v.label || '').includes('不旅遊') || (v.label || '').includes('已跳過'))).length;
    incomeEl.textContent = formatYuanFromWan(income);
    needEl.textContent = `${filled} / 10`;
    gapTextEl.textContent = filled ? '很好，先把理想生活想清楚，差距最後一起揭曉' : '先選幾項看看，最後一次揭牌';
}

// ===== Chart.js 延遲補載工具 =====
function _loadScriptOnce(src) {
    return new Promise((resolve, reject) => {
        // 避免重覆載入同一個 URL
        if (document.querySelector('script[data-dyn="' + src + '"]')) {
            const wait = () => (window.Chart ? resolve() : setTimeout(wait, 80));
            return wait();
        }
        const s = document.createElement('script');
        s.src = src;
        s.setAttribute('data-dyn', src);
        s.onload = () => resolve();
        s.onerror = () => reject(new Error('Failed to load ' + src));
        document.head.appendChild(s);
    });
}

async function ensureChartJs() {
    if (typeof Chart !== 'undefined') return;
    try {
        await _loadScriptOnce('https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js');
    } catch (e) {
        console.error('[Chart] 載入失敗：', e);
    }
    // datalabels 可選，失敗不影響主圖
    if (typeof ChartDataLabels === 'undefined') {
        try {
            await _loadScriptOnce('https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@2.2.0/dist/chartjs-plugin-datalabels.min.js');
        } catch (e) {
            console.warn('[Chart] datalabels 載入失敗（不影響主圖）：', e);
        }
    }
}

async function renderPieChart(chartCanvas, shareItems) {
    if (!chartCanvas) { console.warn('[Chart] 找不到 canvas #shareChart'); return; }
    if (!shareItems || !shareItems.length) { console.warn('[Chart] 無資料可繪製'); return; }

    await ensureChartJs();

    if (typeof Chart === 'undefined') {
        console.error('[Chart] Chart.js 仍無法使用，已放棄渲染圓餅圖');
        return;
    }

    // 連續修正時前一次的非同步繪製可能尚未銷毀，先清掉同一張 canvas 上的舊圖
    const existingChart = Chart.getChart(chartCanvas);
    if (existingChart) existingChart.destroy();

    try {
        const chartPlugins = (typeof ChartDataLabels !== 'undefined') ? [ChartDataLabels] : [];
        window.sharePieChart = new Chart(chartCanvas.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: shareItems.map(it => it.name),
                datasets: [{
                    data: shareItems.map(it => it.amount),
                    backgroundColor: shareItems.map(it => it.color),
                    borderColor: '#ffffff',
                    borderWidth: 2,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '72%',
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const item = shareItems[context.dataIndex];
                                return `${item.name}：${formatYuanPerMonthFromWan(item.amount)}｜占每月收入 ${item.pctIncome.toFixed(0)}%`;
                            }
                        }
                    },
                    datalabels: {
                        color: '#ffffff',
                        font: { weight: '700', size: 12 },
                        formatter: function(value, ctx) {
                            const item = shareItems[ctx.dataIndex];
                            return item.pctShare >= 4 ? `${item.pctShare.toFixed(1)}%` : '';
                        }
                    }
                }
            },
            plugins: chartPlugins
        });
        console.log('[Chart] 圓餅圖渲染完成（' + shareItems.length + ' 項）');
    } catch (err) {
        console.error('[Chart] 圓餅圖繪製失敗：', err);
    }
}

// ===== CALCULATE RESULTS =====

function calcResults(goToResult = true) {
    if (!Object.keys(exp).length) return alert('請至少填寫一個人生項目！');
    refreshAgeDerivedExpenses();
    if (goToResult && !baselineExp) {baselineExp=cloneExp(exp);baselineProfile={...u};}
    currentSummary=summarizeExp(exp);
    if(baselineExp)baselineSummary=summarizeExp(baselineExp);
    const revisionAge=document.getElementById('r-retire-age');if(revisionAge){revisionAge.value=u.retire;revisionAge.min=Math.max(40,u.age+1);}

    const currentIncome = u.income;
    const yearsToRetire = Math.max(u.retire - u.age, 0);
    const colors = ['#3c84e6','#f39838','#73bf45','#8f78d8','#f06b79','#f5b321','#39c1b7','#5b6ee1','#9c7bff','#98a4c0'];

    const catNames = {
        house:'🏠 房子', car:'🚗 車子', wedding:'🏡 家庭開銷',
        children:'👶 小孩', parents:'👴 孝養父母',
        retirement:'🏖️ 退休準備', medical:'🏥 醫療 / 保險', emergency:'✈️ 旅行',
        living:'💰 每月生活費', other:'🎁 其他'
    };

    let totalExp = 0;
    let retirementTargetTotal = 0;
    let retirementMonthlyNeed = 0;
    const items = []; const fixedOrder = ['living','house','car','wedding','children','parents','emergency','medical','retirement','other'];
    const shareItems = [];

    fixedOrder.forEach(k => {
        const v = exp[k];
        if (v && v.amount > 0) {
            totalExp += v.amount;
            if (k === 'retirement') {
                retirementTargetTotal = v.targetTotal || 0;
                retirementMonthlyNeed = v.targetMonthly || 0;
            }
            const item = {
                key: k,
                name: catNames[k],
                choice: v.choice || catNames[k],
                label: v.label,
                amount: v.amount
            };
            items.push(item);
            shareItems.push({
                ...item,
                pctIncome: 0
            });
        }
    });

    // 固定順序不排序，直接計算占比
    shareItems.forEach(it => {
        it.pctIncome = totalExp > 0 ? (it.amount / totalExp * 100) : 0;
    });

    const gap = totalExp - currentIncome;
    const gapYear = gap * 12;
    const maxBar = Math.max(currentIncome, totalExp, 0.1);

    document.getElementById('r-greeting').textContent = `${u.nickname}，這就是你理想生活的現實版本`;
    document.getElementById('r-total').textContent = wanToYuan(totalExp).toLocaleString();
    document.getElementById('r-income').textContent = formatYuanPerMonthFromWan(currentIncome);
    document.getElementById('r-expense').textContent = formatYuanPerMonthFromWan(totalExp);

    const noteEl = document.getElementById('r-note');
    if (noteEl) {
        const retirementLine = retirementTargetTotal > 0
            ? `你設定的退休生活，代表退休後每月要 <strong>${formatYuanPerMonthFromWan(retirementMonthlyNeed)}</strong>${(exp.retirement?.housingMonthly>0&&exp.retirement.housingYears<Math.max(85-u.retire,0))?`（前 ${exp.retirement.housingYears} 年含房貸，之後每月 <strong>${formatYuanPerMonthFromWan(exp.retirement.baseMonthly)}</strong>）`:''}，而且要在退休前 <strong>${yearsToRetire} 年</strong> 先存到 <strong>${formatYuanFromWan(retirementTargetTotal)}</strong>。`
            : '你剛剛填的每一項，不是想像，而是未來真實會發生的現金流。';
        const mortgageLine = mortgageReminderText(exp.retirement);
        noteEl.innerHTML = `你剛剛不是在填表，你是在替未來的自己選生活。<br>${retirementLine}${mortgageLine ? `<br>※ ${mortgageLine}` : ''}`;
    }

    const gEl = document.getElementById('r-gap');
    const gapCardEl = document.getElementById('r-gap-card');
    const gapYearEl = document.getElementById('r-gap-year');
    const retTotalEl = document.getElementById('r-ret-total');
    const retSubEl = document.getElementById('r-ret-sub');

    if (gap > 0) {
        gEl.textContent = `每月還差 ${formatYuanPerMonthFromWan(gap)}`;
        gEl.className = 'compare-val clr-bad';
        gapCardEl.textContent = formatYuanFromWan(gap);
        gapYearEl.textContent = formatYuanFromWan(gapYear);
    } else {
        gEl.textContent = `每月多出 ${formatYuanPerMonthFromWan(Math.abs(gap))}`;
        gEl.className = 'compare-val clr-good';
        gapCardEl.textContent = formatYuanFromWan(Math.abs(gap));
        gapYearEl.textContent = formatYuanFromWan(Math.abs(gapYear));
    }

    if (retirementTargetTotal > 0) {
        retTotalEl.textContent = formatYuanFromWan(retirementTargetTotal);
        retSubEl.textContent = yearsToRetire > 0 ? `${yearsToRetire} 年內要存完` : '已到退休年齡';
    } else {
        retTotalEl.textContent = '未設定';
        retSubEl.textContent = '退休目標';
    }

    document.getElementById('r-income-pct').textContent = formatYuanPerMonthFromWan(currentIncome);
    document.getElementById('r-expense-pct').textContent = formatYuanPerMonthFromWan(totalExp);
    setTimeout(() => {
        document.getElementById('bar-i').style.width = (currentIncome/maxBar*100) + '%';
        document.getElementById('bar-e').style.width = (totalExp/maxBar*100) + '%';
    }, 400);

    // pie chart integrated in results page
    const shareWrap = document.getElementById('r-share');
    const chartCanvas = document.getElementById('shareChart');
    document.getElementById('r-share-total').innerHTML = `${wanToYuan(totalExp).toLocaleString()} <span>元</span>`;

    const totalShare = shareItems.reduce((sum, item) => sum + item.amount, 0);
    shareItems.forEach((it, idx) => {
        it.color = colors[idx % colors.length];
        it.pctShare = totalShare > 0 ? (it.amount / totalShare * 100) : 0;
    });

    if (window.sharePieChart) {
        try { window.sharePieChart.destroy(); } catch(e) {}
    }

    // 確保 Chart.js 已載入（若本地路徑 + onerror fallback 仍未到位就動態補載）
    renderPieChart(chartCanvas, shareItems);

    shareWrap.innerHTML = shareItems.map(it => {
        const pctText = currentIncome > 0 ? `${it.pctIncome.toFixed(0)}%` : '—';
        return `
            <div class="share-row">
                <div class="share-name">
                    <span class="share-dot" style="background:${it.color}"></span>
                    <span class="share-text">${it.name}</span>
                </div>
                <div class="share-money">${wanToYuan(it.amount).toLocaleString()} 元</div>
                <div class="share-pct">占每月收入 ${pctText}</div>
            </div>
        `;
    }).join('');

    document.getElementById('r-breakdown').innerHTML = items.map(it => `
        <div class="breakdown-item">
            <div>
                <div class="breakdown-name">${it.choice}<button class="edit-inline-btn" onclick="editItem('${it.key}')">修正</button></div>
                <div class="breakdown-sub">${it.label}</div>
            </div>
            <div class="breakdown-amt">${wanToYuan(it.amount).toLocaleString()} 元 / 月</div>
        </div>`).join('');

    const quiet = document.getElementById('r-quiet');
    if (gap > 0) {
        quiet.innerHTML = `
            <div class="quiet-box-title">現實很殘酷，但也代表你還有機會改變。</div>
            <div class="quiet-box-text">
                你現在每月收入是 <strong>${formatYuanPerMonthFromWan(currentIncome)}</strong>，但你親手選出來的生活，需要 <strong>${formatYuanPerMonthFromWan(totalExp)}</strong>。<br>
                這中間差的不是感覺，而是每月 <strong>${formatYuanFromWan(gap)}</strong>、每年 <strong>${formatYuanFromWan(gapYear)}</strong>。${retirementTargetTotal > 0 ? `退休前還要先把 <strong>${formatYuanFromWan(retirementTargetTotal)}</strong> 存好。` : ''}
            </div>
        `;
    } else {
        quiet.innerHTML = `
            <div class="quiet-box-title">至少，這份理想生活目前有機會接得住。</div>
            <div class="quiet-box-text">
                你現在每月還有 <strong>${formatYuanFromWan(Math.abs(gap))}</strong> 的空間。${retirementTargetTotal > 0 ? `但退休前依然要把 <strong>${formatYuanFromWan(retirementTargetTotal)}</strong> 先準備好。` : '接下來可以把收入來源、資產與存款也放進來，確認這份從容是不是真的站得住。'}
            </div>
        `;
    }

    const cta = document.getElementById('r-cta');
    if (gap > 0) {
        cta.className = 'cta-box danger';
        cta.innerHTML = `
            <div class="cta-box-title">下一步，不是重算，是找出怎麼補。</div>
            <div class="cta-box-text">
                把正職收入、斜槓收入、投資收入、現有存款一起放進來，才會知道這個差距要靠什麼補、補多少、多久補完。
            </div>
            <button class="cta-btn" onclick="alert('下一步，就是把收入來源與現有資產一起放進來。')">我想知道怎麼補這個差距 →</button>
        `;
    } else {
        cta.className = 'cta-box safe';
        cta.innerHTML = `
            <div class="cta-box-title">至少，這份生活目前還接得住。</div>
            <div class="cta-box-text">
                接下來真正要看的，是你靠什麼收入撐住它，以及退休前那筆錢要怎麼更穩地準備。
            </div>
            <button class="cta-btn" onclick="alert('下一步，可以把收入來源與資產放進來，確認這份從容能不能成立。')">繼續看收入與資產 →</button>
        `;
    }

    if (goToResult) goStep(3);
}


function editItem(cat) {
    populateModal(cat);
    openModal(cat);
}

function populateModal(cat) {
    const saved = exp[cat];
    if (!saved || !saved.data) return;
    const d = saved.data;

    if (cat === 'house') {
        document.getElementById('mh-ownership').value = d.ownership || '';
        document.getElementById('mh-type').value = d.type || '';
        onHouseOptionChange();
        document.getElementById('mh-budget').value = d.budget || '';
        onHouseBudgetChange();
        document.getElementById('mh-custom').value = d.custom || '';
    } else if (cat === 'car') {
        document.getElementById('mc-type').value = d.type || '';
        onCarType();
        document.getElementById('mc-custom').value = d.custom || '';
        document.getElementById('mc-fuel').value = d.fuelRaw || '0.3';
        onFuelChange();
        document.getElementById('mc-fuel-custom').value = d.fuelCustom || '';
        document.getElementById('mc-parking').value = d.parkingRaw || '0.5';
        onParkingChange();
        document.getElementById('mc-parking-custom').value = d.parkingCustom || '';
    } else if (cat === 'wedding') {
        document.getElementById('mw-utility').value = d.utilityRaw || '0.3';
        onWeddingSelectChange('mw-utility','mw-utility-custom-wrap');
        document.getElementById('mw-utility-custom').value = d.utilityCustom || '';
        document.getElementById('mw-network').value = d.networkRaw || '0.15';
        onWeddingSelectChange('mw-network','mw-network-custom-wrap');
        document.getElementById('mw-network-custom').value = d.networkCustom || '';
        document.getElementById('mw-home').value = d.homeRaw || '0.5';
        onWeddingSelectChange('mw-home','mw-home-custom-wrap');
        document.getElementById('mw-home-custom').value = d.homeCustom || '';
        document.getElementById('mw-food').value = d.foodRaw || '1.2';
        onWeddingSelectChange('mw-food','mw-food-custom-wrap');
        document.getElementById('mw-food-custom').value = d.foodCustom || '';
    } else if (cat === 'children') {
        document.getElementById('mk-count').value = d.cnt || 0;
        document.getElementById('mk-type').value = d.type || '3';
        onChildrenType();
        document.getElementById('mk-custom').value = d.custom || '';
    } else if (cat === 'parents') {
        document.getElementById('mp-monthly').value = d.monthly || '';
        document.getElementById('mp-care').value = String(d.care ?? 0);
    } else if (cat === 'retirement') {
        document.getElementById('mr-monthly').value = d.life || '';
        document.getElementById('mr-housing-mode').value = d.housingMode || 'link';
        onRetirementHousingChange();
        document.getElementById('mr-housing-custom').value = d.housingCustom || '';
        document.getElementById('mr-fun').value = d.funRaw || '1';
        onRetirementSelectChange('mr-fun','mr-fun-custom-wrap');
        document.getElementById('mr-fun-custom').value = d.funCustom || '';
        document.getElementById('mr-travel').value = d.travelRaw || '0.5';
        onRetirementSelectChange('mr-travel','mr-travel-custom-wrap');
        document.getElementById('mr-travel-custom').value = d.travelCustom || '';
        document.getElementById('mr-care').value = d.careRaw || '0.8';
        onRetirementSelectChange('mr-care','mr-care-custom-wrap');
        document.getElementById('mr-care-custom').value = d.careCustom || '';
    } else if (cat === 'medical') {
        document.getElementById('mm-type').value = d.type || '0.8';
        onMedicalType();
        document.getElementById('mm-custom').value = d.custom || '';
    } else if (cat === 'emergency') {
        document.getElementById('me-type').value = d.type || '';
        onEmergencyType();
        document.getElementById('me-custom').value = d.custom || '';
    } else if (cat === 'living') {
        document.getElementById('ml-monthly').value = d.monthly || '';
    } else if (cat === 'other') {
        document.getElementById('mo-name').value = d.name || '';
        document.getElementById('mo-amount').value = d.amount || '';
    }
}



function cloneExp(obj) {
    return JSON.parse(JSON.stringify(obj));
}

function summarizeExp(sourceExp) {
    const catNames = {
        house:'🏠 房子', car:'🚗 車子', wedding:'🏡 家庭開銷',
        children:'👶 小孩', parents:'👴 孝養父母',
        retirement:'🏖️ 退休準備', medical:'🏥 醫療 / 保險', emergency:'✈️ 旅行',
        living:'💰 每月生活費', other:'🎁 其他'
    };
    const order = ['living','house','car','wedding','children','parents','emergency','medical','retirement','other'];
    let total = 0;
    const items = [];
    order.forEach(k => {
        const v = sourceExp[k];
        if (v && v.amount > 0) {
            total += v.amount;
            items.push({
                key: k,
                name: catNames[k],
                choice: v.choice || catNames[k],
                label: v.label,
                amount: v.amount
            });
        }
    });
    return { total, items };
}




function goCompareStep() {
    if (!baselineExp) {baselineExp=cloneExp(exp);baselineProfile={...u};}
    refreshAgeDerivedExpenses();
    baselineSummary = summarizeExp(baselineExp);
    currentSummary = summarizeExp(exp);

    const currentIncomeYuan = getIncomeBreakdown().total;
    const idealTotalYuan = wanToYuan(baselineSummary.total || 0);
    const adjustTotalYuan = wanToYuan(currentSummary.total || 0);
    const idealGapYuan = idealTotalYuan - currentIncomeYuan;
    const adjustGapYuan = adjustTotalYuan - currentIncomeYuan;

    document.getElementById('cmp-ideal-total').textContent = idealTotalYuan.toLocaleString() + ' 元 / 月';
    document.getElementById('cmp-adjust-total').textContent = adjustTotalYuan.toLocaleString() + ' 元 / 月';

    const idealGapEl = document.getElementById('cmp-ideal-gap');
    idealGapEl.textContent = idealGapYuan >= 0
        ? '需要增加收入 ' + idealGapYuan.toLocaleString() + ' 元'
        : '目前收入已足夠，尚餘 ' + Math.abs(idealGapYuan).toLocaleString() + ' 元';
    idealGapEl.style.color = idealGapYuan >= 0 ? '#e85d4a' : '#22a36a';

    const adjustGapEl = document.getElementById('cmp-adjust-gap');
    adjustGapEl.textContent = adjustGapYuan >= 0
        ? '需要增加收入 ' + adjustGapYuan.toLocaleString() + ' 元'
        : '目前收入已足夠，尚餘 ' + Math.abs(adjustGapYuan).toLocaleString() + ' 元';
    adjustGapEl.style.color = adjustGapYuan >= 0 ? '#e85d4a' : '#22a36a';

    const catNames = {
        house:'🏠 房子', car:'🚗 車子', wedding:'🏡 家庭開銷',
        children:'👶 小孩', parents:'👴 孝養父母',
        retirement:'🏖️ 退休準備', medical:'🏥 醫療 / 保險', emergency:'✈️ 旅行',
        living:'💰 每月生活費', other:'🎁 其他'
    };
    const mapA = Object.fromEntries(baselineSummary.items.map(i => [i.key, i]));
    const mapB = Object.fromEntries(currentSummary.items.map(i => [i.key, i]));
    const order = ['living','house','car','wedding','children','parents','emergency','medical','retirement','other'];
    const list = document.getElementById('cmp-list');

    list.innerHTML = order.map(k => {
        const a = mapA[k] || { key:k, name: catNames[k], label: '未設定', amount: 0 };
        const b = mapB[k] || { key:k, name: catNames[k], label: '未設定', amount: 0 };
        return `<div class="cmp-row">
            <div class="cmp-col-label">
                <div class="cmp-row-name">${a.name}</div>
            </div>
            <div class="cmp-col-ideal">
                <div class="cmp-item-card ideal">
                    <div class="cmp-item-money">${wanToYuan(a.amount).toLocaleString()} 元 / 月</div>
                    <div class="cmp-item-detail">${a.label || '未設定'}</div>
                </div>
            </div>
            <div class="cmp-col-adjust">
                <div class="cmp-item-card adjusted">
                    <div class="cmp-item-money">${wanToYuan(b.amount).toLocaleString()} 元 / 月</div>
                    <div class="cmp-item-detail">${b.label || '未設定'}</div>
                </div>
            </div>
        </div>`;
    }).join('');

    const compareAge=document.getElementById('cmp-retirement-ages');if(compareAge)compareAge.textContent=`退休年齡：理想版 ${baselineProfile?.retire||u.retire} 歲 → 調整版 ${u.retire} 歲`;
    goStep(4);
}




// ===== RESTART =====
function restart() {
    exp = {};
    baselineExp = null;
    baselineProfile = null;
    baselineSummary = null;
    currentSummary = null;
    document.querySelectorAll('.cat-item').forEach(el => {
        el.classList.remove('filled');
        const b = el.querySelector('.check-badge');
        if (b) b.remove();
    });
    document.querySelectorAll('.cat-amt').forEach(el => el.textContent = '');
    document.getElementById('bar-i').style.width = '0%';
    document.getElementById('bar-e').style.width = '0%';

    const houseOwnership = document.getElementById('mh-ownership');
    const houseType = document.getElementById('mh-type');
    const houseBudget = document.getElementById('mh-budget');
    const houseCustom = document.getElementById('mh-custom');
    if (houseOwnership) houseOwnership.value = '';
    if (houseType) houseType.value = '';
    if (houseBudget) houseBudget.innerHTML = '<option value="">請先選擇擁有方式與住宅類型</option>';
    if (houseCustom) houseCustom.value = '';
    toggle('mh-recommend-wrap', false);
    toggle('mh-custom-wrap', false);

    goStep(0);
    updateLiveSummary();
}


// ===== STEP 5: INCOME STRUCTURE =====
let slashItems = [];
let slashIdCounter = 0;

function initStep5() {
    // Pre-fill work income from step1
    const workFromStep1 = Math.round((u.income || 0) * 10000);
    const el = document.getElementById('work-from-step1');
    if (el) el.textContent = workFromStep1 > 0 ? workFromStep1.toLocaleString() + ' 元 / 月' : '—';
    // If no override entered, seed input with step1 value
    const workInput = document.getElementById('inc-work-input');
    if (workInput && !workInput.value && workFromStep1 > 0) {
        workInput.value = workFromStep1;
    }
    updateIncomeTotals();
}

function updateIncomeTotals() {
    const { work: workIncome, slash: slashIncome, invest: investIncome } = getIncomeBreakdown();

    // Update invest subtotal display
    document.getElementById('invest-subtotal').textContent = Math.round(investIncome).toLocaleString() + ' 元';

    const total = workIncome + slashIncome + investIncome;

    // Update top bar displays
    const fmt = n => Math.round(n).toLocaleString() + ' 元';
    document.getElementById('inc-work-display').textContent = fmt(workIncome);
    document.getElementById('inc-slash-display').textContent = fmt(slashIncome);
    document.getElementById('inc-invest-display').textContent = fmt(investIncome);
    document.getElementById('inc-total-display').textContent = fmt(total);

    // Gap vs 理想生活
    const idealTotal = baselineSummary ? Math.round(baselineSummary.total * 10000) : 0;
    const gap = idealTotal - total;
    const gapEl = document.getElementById('inc-gap-display');
    if (gapEl) {
        if (!idealTotal) {
            gapEl.textContent = '請先完成理想生活設定';
            gapEl.style.color = '#7a90b8';
        } else if (gap > 0) {
            gapEl.textContent = '還差 ' + gap.toLocaleString() + ' 元';
            gapEl.style.color = '#e85d4a';
        } else {
            gapEl.textContent = '已超過 ' + Math.abs(gap).toLocaleString() + ' 元';
            gapEl.style.color = '#22c58a';
        }
    }

    // Gap vs 調整後生活
    const adjustTotal = currentSummary ? Math.round(currentSummary.total * 10000) : 0;
    const gapAdjust = adjustTotal - total;
    const gapAdjEl = document.getElementById('inc-gap-adjust-display');
    if (gapAdjEl) {
        if (!adjustTotal) {
            gapAdjEl.textContent = '請先完成調整版設定';
            gapAdjEl.style.color = '#7a90b8';
        } else if (gapAdjust > 0) {
            gapAdjEl.textContent = '還差 ' + gapAdjust.toLocaleString() + ' 元';
            gapAdjEl.style.color = '#e85d4a';
        } else {
            gapAdjEl.textContent = '已超過 ' + Math.abs(gapAdjust).toLocaleString() + ' 元';
            gapAdjEl.style.color = '#22c58a';
        }
    }
}

function calcInvestReturn() {
    const principal = parseFloat(document.getElementById('inc-invest-principal')?.value) || 0;
    const monthly = Math.round(principal * 0.07 / 12);
    const formulaEl = document.getElementById('invest-formula');
    if (formulaEl) {
        formulaEl.textContent = principal > 0 ? monthly.toLocaleString() + ' 元 / 月' : '—';
    }
    updateIncomeTotals();
}

function onInvestManualInput() {
    updateIncomeTotals();
}

// Slash modal
function openSlashModal() {
    document.getElementById('m-slash').classList.add('open');
    document.getElementById('slash-type-select').value = '';
    document.getElementById('slash-name-input').value = '';
    document.getElementById('slash-amount-input').value = '';
}
function closeSlashModal() {
    document.getElementById('m-slash').classList.remove('open');
}
function onSlashTypeChange() {
    const typeNames = {
        freelance: '接案收入', content: '創作收入', ecommerce: '電商收入',
        delivery: '外送收入', teaching: '教學收入', rental: '出租收入', other: '副業收入'
    };
    const t = document.getElementById('slash-type-select').value;
    const nameInput = document.getElementById('slash-name-input');
    if (t && !nameInput.value) nameInput.value = typeNames[t] || '';
}
function saveSlashItem() {
    const name = document.getElementById('slash-name-input').value.trim();
    const amount = parseFloat(document.getElementById('slash-amount-input').value) || 0;
    if (!name) return alert('請輸入項目名稱');
    if (!amount || amount <= 0) return alert('請輸入每月收入金額');

    const item = { id: ++slashIdCounter, name, amount };
    slashItems.push(item);
    renderSlashItems();
    updateIncomeTotals();
    closeSlashModal();
}
function deleteSlashItem(id) {
    slashItems = slashItems.filter(i => i.id !== id);
    renderSlashItems();
    updateIncomeTotals();
}
function renderSlashItems() {
    const list = document.getElementById('slash-items-list');
    if (!list) return;
    const subtotal = slashItems.reduce((s, i) => s + i.amount, 0);
    document.getElementById('slash-subtotal').textContent = Math.round(subtotal).toLocaleString() + ' 元';
    list.innerHTML = slashItems.map(item => `
        <div class="slash-item">
            <span class="slash-item-name">${item.name}</span>
            <span class="slash-item-amount">${Math.round(item.amount).toLocaleString()} 元</span>
            <button class="slash-item-del" onclick="deleteSlashItem(${item.id})">✕</button>
        </div>`).join('');
}

// Patch goStep to also init step5 when navigating there
const _step5GoStep = goStep;
goStep = function(n) {
    _step5GoStep(n);
    if (n === 5) setTimeout(initStep5, 0);
};

// Slash modal close on overlay
document.getElementById('m-slash').addEventListener('click', function(e) {
    if (e.target === this) closeSlashModal();
});



// ===== STEP 6: CAREER DECISION =====
function s6Choose(choice) {
    document.getElementById('s6-question').style.display = 'none';
    if (choice === 'yes') {
        document.getElementById('s6-yes').style.display = 'block';
        s6FillGaps();
        s6FillRetTarget('s6y');
        setTimeout(() => { s6RetFillInputs('s6y'); s6RetCalc('yes'); }, 50);
    } else {
        document.getElementById('s6-no').style.display = 'block';
        s6FillRetTarget('s6n');
        setTimeout(() => { s6RetFillInputs('s6n'); s6RetCalc('no'); }, 50);
    }
}

// 重點顯示：退休後每月目標金流（= exp.retirement.targetMonthly × 10000）
function s6FillRetTarget(prefix) {
    try {
        const amountEl = document.getElementById(prefix + '-target-amount');
        const subEl    = document.getElementById(prefix + '-target-sub');
        if (!amountEl) return;

        const yuan = retirementMonthlyAverageYuan();
        const r = exp?.retirement || {};

        if (yuan > 0) {
            amountEl.innerHTML = yuan.toLocaleString('zh-TW') + ' <span class="unit">元 / 月</span>';
            if (subEl) {
                const housing = r.housingMonthly > 0
                    ? `，並含退休後居住支出 <b>${Math.round(r.housingMonthly * 10000).toLocaleString('zh-TW')} 元 / 月</b>`
                    : '';
                const mortgage = mortgageReminderText(r);
                subEl.innerHTML = '由你設定的 <b>生活費</b>、<b>娛樂費</b>、<b>旅行費</b>、<b>醫療費</b> 加總' + housing + '（退休期間平均每月）'
                    + (mortgage ? `<br>※ ${mortgage}` : '');
            }
        } else {
            amountEl.innerHTML = '<span class="s6-ret-highlight-empty">請先完成「退休生活」設定</span>';
            if (subEl) {
                subEl.innerHTML = '回到 Step 2 點開「退休生活」，填寫生活費、娛樂、旅行、醫療等項目後會自動計算';
            }
        }
    } catch (err) {
        console.warn('[s6FillRetTarget] 目標金流帶入失敗：', err);
    }
}

function s6Back() {
    document.getElementById('s6-question').style.display = 'block';
    document.getElementById('s6-yes').style.display = 'none';
    document.getElementById('s6-no').style.display = 'none';
}

function s6FillGaps() {
    const fmt = n => Math.round(n).toLocaleString() + ' 元 / 月';

    // 理想版
    const idealTotal = baselineSummary ? Math.round(baselineSummary.total * 10000) : 0;
    document.getElementById('s6-ideal-need').textContent = idealTotal > 0 ? fmt(idealTotal) : '—';
    document.getElementById('s6-ideal-gap-text').textContent = idealTotal > 0
        ? '這是你理想生活需要的月收入總額' : '請先完成理想生活設定';

    // 調整版
    const adjustTotal = currentSummary ? Math.round(currentSummary.total * 10000) : 0;
    document.getElementById('s6-adjust-need').textContent = adjustTotal > 0 ? fmt(adjustTotal) : '—';
    document.getElementById('s6-adjust-gap-text').textContent = adjustTotal > 0
        ? '這是你調整版生活需要的月收入總額' : '請先完成調整版設定';

    // Animate bars after a short delay
    setTimeout(() => {
        document.querySelectorAll('.s6-bar-fill, .s6-ind-fill').forEach(el => {
            const w = el.style.width;
            el.style.width = '0%';
            requestAnimationFrame(() => { el.style.width = w; });
        });
    }, 100);
}

function s6RetFillInputs(prefix) {
    // 1. 姓名
    const name = document.getElementById('f-nickname')?.value?.trim() || '';
    const nameEl = document.getElementById(prefix + '-name');
    if (nameEl && !nameEl.value) nameEl.value = name;

    // 2. 性別
    const isFemale = document.getElementById('gb-F')?.classList.contains('active');
    const genderEl = document.getElementById(prefix + '-gender');
    if (genderEl) genderEl.value = isFemale ? 'F' : 'M';

    // 3. 年齡
    const age = parseInt(document.getElementById('f-age')?.value) || 30;
    const ageEl = document.getElementById(prefix + '-age');
    if (ageEl && !ageEl.value) ageEl.value = age;

    // 4. 退休年齡
    const retire = parseInt(document.getElementById('f-retire')?.value) || 65;
    const retireEl = document.getElementById(prefix + '-retire');
    if (retireEl) retireEl.value = Math.max(u.retire, age + 1);

    // 5. 退休月現金流目標＝退休後平均每月支出（不是投資收入）
    const retirementTarget = retirementMonthlyAverageYuan();
    const cashflowEl = document.getElementById(prefix + '-cashflow');
    if (cashflowEl && !cashflowEl.value && retirementTarget > 0) cashflowEl.value = retirementTarget;

    // 6. 已準備資產（可投資資金、每月確定現金流）：一律帶入最新值，三頁雙向同步
    const prep = getPreparedAssets();
    const savingsEl = document.getElementById(prefix + '-savings');
    if (savingsEl) savingsEl.value = prep.principal > 0 ? prep.principal : '';
    const incomeEl = document.getElementById(prefix + '-income');
    if (incomeEl) incomeEl.value = prep.cashflow > 0 ? prep.cashflow : '';
}

// ── 已準備資產：資產配息頁、退休快速試算、完整退休規劃三頁共用（雙向同步）──
// 單一來源是資產配息頁的兩個欄位：可投資資金（以 7% 換算月配息）、每月確定現金流
function getPreparedAssets() {
    const val = id => parseFloat(document.getElementById(id)?.value) || 0;
    return { principal: val('inc-invest-principal'), cashflow: val('inc-invest-input') };
}
function setPreparedAssets({ principal, cashflow }) {
    const put = (id, v) => {
        const el = document.getElementById(id);
        if (el && el !== document.activeElement) el.value = v > 0 ? v : '';
    };
    ['inc-invest-principal', 's6y-savings', 's6n-savings'].forEach(id => put(id, principal));
    ['inc-invest-input', 's6y-income', 's6n-income'].forEach(id => put(id, cashflow));
    RS.preparedAmount = principal || 0;
    RS.otherIncome = cashflow || 0;
    calcInvestReturn();   // 更新資產配息頁的 7% 換算與收入小計
}
// 目前顯示中的快速試算區塊（理想版 s6y／調整版 s6n），沒有則回傳 null
function activeS6Prefix() {
    if (document.getElementById('s6-yes')?.style.display === 'block') return 's6y';
    if (document.getElementById('s6-no')?.style.display === 'block') return 's6n';
    return null;
}
// 完整退休規劃修改後，同步回快速試算欄位（返回上一步時看到的是同一組數字）
function pushRetirementToQuick() {
    ['s6y', 's6n'].forEach(p => {
        const set = (id, v) => { const el = document.getElementById(p + id); if (el) el.value = v; };
        set('-name', RS.clientName || '');
        set('-gender', RS.gender);
        set('-age', RS.currentAge);
        set('-retire', RS.retirementAge);
        set('-cashflow', RS.monthlyExpense);
    });
    setPreparedAssets({ principal: RS.preparedAmount, cashflow: RS.otherIncome });
}

function s6RetCalc(which) {
    const prefix = which === 'yes' ? 's6y' : 's6n';
    const resultEl = document.getElementById(prefix + '-result');
    if (!resultEl) return;

    const num = id => parseFloat(document.getElementById(prefix + id)?.value) || 0;
    const age      = parseInt(document.getElementById(prefix + '-age')?.value) || 0;
    const retire   = parseInt(document.getElementById(prefix + '-retire')?.value) || 0;
    const cashflow = num('-cashflow');
    const savings  = num('-savings');
    const income   = num('-income');
    const gender   = document.getElementById(prefix + '-gender')?.value || 'M';

    // 已準備資產與資產配息頁、完整退休規劃雙向同步
    setPreparedAssets({ principal: savings, cashflow: income });

    if (!age || !retire || retire <= age) {
        resultEl.innerHTML = '<span style="color:#aaa;font-size:13px;">請填寫年齡與退休年齡</span>';
        return;
    }
    if (!cashflow) {
        resultEl.innerHTML = '<span style="color:#aaa;font-size:13px;">請填入退休月現金流以開始試算</span>';
        return;
    }

    const fmt = n => Math.round(n).toLocaleString('zh-TW');
    // 與完整退休規劃同一套公式（retCompute）；投報率、平均餘命沿用完整規劃的設定
    const D = retCompute({
        currentAge: age, retirementAge: retire, gender,
        lifeExpectancy: RS.lifeExpectancy || 85, assumedReturn: RS.assumedReturn ?? 6,
        monthlyExpense: cashflow, preparedAmount: savings, otherIncome: income
    });
    const row = (label, val, cls = '') =>
        `<div class="ret-row"><span class="ret-label">${label}</span><span class="ret-val ${cls}">${val}</span></div>`;

    let html = row('工作年數 / 退休年數', `${D.workYears} 年 ／ ${D.retireYears} 年`)
        + row('退休月現金流目標', `${fmt(cashflow)} 元 / 月`, 'blue');
    if (savings > 0) html += row('存款每月可配息（7%）', `+${fmt(savings * 0.07 / 12)} 元 / 月`, 'green');
    if (income > 0)  html += row('每月確定現金流', `+${fmt(income)} 元 / 月`, 'green');
    if (savings > 0 || income > 0) {
        html += row('尚需補足月現金流', D.netMonthlyExpense > 0 ? `${fmt(D.netMonthlyExpense)} 元 / 月` : '已足夠 ✓', D.netMonthlyExpense > 0 ? 'red' : 'green');
    }
    html += row('方案一｜需自存退休總金額', `${fmt(D.selfNeed)} 元`)
        + row('方案一｜每月自存', `${fmt(D.selfMonthly)} 元 / 月`, 'red');
    if (D.capDist > 0) {
        html += row('方案二｜月配息所需本金（7%）', `${fmt(D.capDist)} 元`, 'blue')
            + row('方案二｜保單月存', `${fmt(D.policyMonthly)} 元 / 月`, 'blue')
            + row('退休時預估解約金', `${fmt(D.svR)} 元`, 'green');
        if (D.reached === false) html += row('提醒', '月存已達試算上限仍不足目標', 'red');
    }
    html += `<div style="font-size:12px;color:#7a90b8;margin-top:8px;">假設投報率 ${RS.assumedReturn ?? 6}%｜平均餘命 ${RS.lifeExpectancy || 85} 歲（可於完整退休規劃調整）</div>`;
    const mortgage = mortgageReminderText(exp?.retirement, retire);
    if (mortgage) html += `<div style="font-size:12px;color:#c2410c;margin-top:6px;">※ ${mortgage}</div>`;

    resultEl.innerHTML = html;
}

function initStep6() {
    // Reset to question screen each time
    document.getElementById('s6-question').style.display = 'block';
    document.getElementById('s6-yes').style.display = 'none';
    document.getElementById('s6-no').style.display = 'none';
}

// Extend goStep to also init step6
const _s6GoStep = goStep;
goStep = function(n) {
    _s6GoStep(n);
    if (n === 6) setTimeout(initStep6, 0);
};


// Init
updateProgress();
updateLiveSummary();


// ============================================================
// Secondary block — originally at lines 7320-7794
// ============================================================

// ── UND 試算：統一使用共用引擎 apps/shared/und-engine.js（與 UND 試算頁、公司 Excel 一致）──
const RET_MAX_MS = 10000;   // 目標保費每月上限，超過部分轉為定期定額超額保費
function retGoalSeek(S, capDist) {
  return UNDEngine.retirementGoalSeek(S, capDist);
}
function retCompute(S) {
  const workYears=S.retirementAge-S.currentAge, retireYears=S.lifeExpectancy-S.retirementAge;
  const otherIncome=S.otherIncome||0;
  const totalNeed=S.monthlyExpense*retireYears*12;
  // 方案一（自己存）：退休總花費扣掉已準備本金與退休期間的其他投資收入
  const selfNeed=Math.max(0,totalNeed-S.preparedAmount-otherIncome*12*retireYears);
  const selfAnnual=workYears>0?selfNeed/workYears:0, selfMonthly=selfAnnual/12;
  const preparedMonthly=S.preparedAmount*0.07/12+otherIncome;
  const netMonthlyExpense=Math.max(0,S.monthlyExpense-preparedMonthly);
  const capDist=netMonthlyExpense*12/0.07;
  const ac=retGoalSeek(S,capDist);
  const ri=Math.min(workYears,(ac.res?.length||1)-1);
  const svR=ac.res[ri]?.sv||0, monthDist=svR*0.07/12;
  const policyAnnual=ac.at+ac.me*12, policyMonthly=policyAnnual/12;
  const expW=S.monthlyExpense/10000, needW=Math.round(totalNeed/10000), capW=Math.round(capDist/10000);
  return {workYears,retireYears,totalNeed,selfNeed,otherIncome,selfAnnual,selfMonthly,capDist,preparedMonthly,netMonthlyExpense,
    monthlySaving:ac.ms,monthlyExtra:ac.me,annualTarget:ac.at,saWan:ac.sw,sa:ac.si,opt:ac.res,ri,svR,monthDist,
    policyAnnual,policyMonthly,expW,needW,capW,reached:ac.reached,saRaised:ac.saRaised,ptype:ac.ptype};
}
const retFmt = n => n==null?'-':Math.round(n).toLocaleString('zh-TW');

// ── State ──
const RS = {
  page:'input', clientName:'', gender:'M',
  currentAge:30, retirementAge:65, monthlyExpense:30000,
  lifeExpectancy:85, assumedReturn:6, preparedAmount:0, otherIncome:0
};

function retGetDataFromMain() {
  // 1. 姓名
  const name = document.getElementById('f-nickname')?.value?.trim() || '';
  RS.clientName = name;
  // 2. 年紀
  const age = parseInt(document.getElementById('f-age')?.value) || 30;
  RS.currentAge = age;
  // 3. 性別
  RS.gender = (document.getElementById('gb-F')?.classList.contains('active')) ? 'F' : 'M';
  // 4. 退休年齡
  const retire = parseInt(document.getElementById('f-retire')?.value) || 65;
  RS.retirementAge = Math.max(retire, age+1);
  // 5. 退休後每月花費：退休期間平均每月支出（房貸只算到繳清，攤平到整段退休期）
  const retirementExpense = retirementMonthlyAverageYuan();
  RS.monthlyExpense = retirementExpense > 0 ? retirementExpense : 30000;
  RS._retirementRaw = retirementExpense;
  // 6. 已準備：投資本金（以 7% 換算月配息）＋ 每月確定現金流；只在 retCompute 扣除一次
  const prep = getPreparedAssets();
  RS.preparedAmount = prep.principal;
  RS.otherIncome = prep.cashflow;
  // 7. 從快速試算頁進來時，以快速試算頁上（可能修改過）的欄位為準
  const p = activeS6Prefix();
  if (p) {
    const v = id => document.getElementById(p + id)?.value;
    if (v('-name')) RS.clientName = v('-name').trim();
    if (v('-gender')) RS.gender = v('-gender');
    if (+v('-age') > 0) RS.currentAge = +v('-age');
    if (+v('-retire') > 0) RS.retirementAge = Math.max(+v('-retire'), RS.currentAge + 1);
    if (+v('-cashflow') > 0) RS.monthlyExpense = +v('-cashflow');
  }
  // 註：下行為舊版殘留（workIncome 未定義會丟 ReferenceError，導致第七頁空白），已移除
  // RS._workIncome = workIncome;
}

function retRender() {
  const root = document.getElementById('retirement-app-root');
  if (RS.page === 'input') {
    root.innerHTML = retInputHTML();
    retBindInput();
  } else {
    root.innerHTML = retReportHTML();
    retBindReport();
  }
}

function retInputHTML() {
  const D = retCompute(RS);
  const hasDeduction = D.preparedMonthly > 0;
  return `
  <div id="ret-input-wrap">
    <div class="ret-page-title">退休財務規劃</div>
    <div class="ret-page-sub">依你填寫的資料自動帶入，可直接微調後產生計畫書</div>
    ${hasDeduction ? `<div class="ret-note-box">💡 退休每月花費 ${retFmt(RS.monthlyExpense)} 元，扣除已準備資產每月可提供的 ${retFmt(Math.round(D.preparedMonthly))} 元後，保單需補足 <b>${retFmt(Math.round(D.netMonthlyExpense))} 元 / 月</b>。</div>` : ''}
    <div class="ret-section">
      <div class="ret-section-title">❶ 客戶基本資料</div>
      <div class="ret-grid2">
        <div class="ret-field" style="grid-column:1/-1"><label>姓名</label><input type="text" class="ret-ic" id="ret-name" value="${RS.clientName}" placeholder="請輸入姓名"></div>
        <div class="ret-field"><label>性別</label>
          <select class="ret-ic" id="ret-gender">
            <option value="M" ${RS.gender==='M'?'selected':''}>男</option>
            <option value="F" ${RS.gender==='F'?'selected':''}>女</option>
          </select>
        </div>
        <div class="ret-field"><label>目前年齡</label><input type="number" class="ret-ic" id="ret-age" value="${RS.currentAge}" min="16" max="70"></div>
      </div>
    </div>
    <div class="ret-section">
      <div class="ret-section-title">❷ 退休規劃設定</div>
      <div class="ret-grid2">
        <div class="ret-field"><label>預計退休年齡</label><input type="number" class="ret-ic" id="ret-retire" value="${RS.retirementAge}" min="40" max="80"></div>
        <div class="ret-field"><label>平均餘命</label><input type="number" class="ret-ic" id="ret-life" value="${RS.lifeExpectancy}" min="60" max="110"></div>
        <div class="ret-field"><label>退休每月花費（元）</label><input type="number" class="ret-ic" id="ret-expense" value="${RS.monthlyExpense}" step="1000"></div>
        <div class="ret-field"><label>存款 / 可投資資金（元）</label><input type="number" class="ret-ic" id="ret-prepared" value="${RS.preparedAmount}" step="100000"></div>
        <div class="ret-field"><label>每月確定現金流（元）</label><input type="number" class="ret-ic" id="ret-other-income" value="${RS.otherIncome || 0}" step="1000"></div>
      </div>
      <div style="font-size:12px;color:#6b7280;margin-top:8px;">存款以 7% 換算每月配息、加上每月確定現金流（租金、年金、月配息等），會從退休每月花費中扣除；與「資產配息」頁同步。</div>
      ${mortgageReminderText(exp?.retirement, RS.retirementAge) ? `<div style="font-size:12px;color:#c2410c;margin-top:6px;">※ ${mortgageReminderText(exp.retirement, RS.retirementAge)}</div>` : ''}
    </div>
    <div class="ret-section">
      <div class="ret-section-title">❸ 保單試算結果（自動）</div>
      ${D.preparedMonthly > 0 ? `<div style="background:#fffbea;border:1px solid #f0d88a;border-radius:10px;padding:10px 14px;font-size:12px;color:#7a5c10;margin-bottom:12px;">${RS.preparedAmount > 0 ? `存款 ${retFmt(RS.preparedAmount)} 元，以 7% 年化換算每月 ${retFmt(Math.round(RS.preparedAmount*0.07/12))} 元` : ''}${RS.preparedAmount > 0 && D.otherIncome > 0 ? '；' : ''}${D.otherIncome > 0 ? `每月確定現金流 ${retFmt(D.otherIncome)} 元` : ''}，保單目標已自動扣除。</div>` : ''}
      <div class="ret-grid2">
        <div class="ret-field"><label>假設投報率 %（-20～20）</label><input type="number" class="ret-ic" id="ret-return" value="${RS.assumedReturn}" min="${UNDEngine.ROR_MIN}" max="${UNDEngine.ROR_MAX}" step="0.5"></div>
        <div class="ret-field"><label>需準備退休資金</label><div class="ret-ro">${retFmt(Math.round(D.capDist))}</div></div>
        <div class="ret-field"><label>月存金額</label><div class="ret-ro">${retFmt(D.monthlySaving)}${D.monthlySaving>=RET_MAX_MS?'<span style="color:#e85d4a;font-size:11px;margin-left:6px;">已達上限</span>':''}</div></div>
        <div class="ret-field"><label>年目標保費</label><div class="ret-ro">${retFmt(D.annualTarget)}</div></div>
        <div class="ret-field"><label>月超額保費</label><div class="ret-ro">${retFmt(D.monthlyExtra)}</div></div>
        <div class="ret-field"><label>基本保額</label><div class="ret-ro">${retFmt(D.sa)}</div></div>
      </div>
      ${D.reached===false?'<div style="font-size:12px;color:#e85d4a;margin-top:8px;">※ 月存已達試算上限仍不足目標，請調整退休年齡或投報率</div>':''}${D.saRaised?'<div style="font-size:12px;color:#6b7280;margin-top:8px;">※ 依條款第十一條，保額已調高至繳費期間保費都能繳入的最低保額</div>':''}
      <div style="background:#f0f7ff;border:1px solid #c0d8ff;border-radius:12px;padding:12px 16px;font-size:13px;color:#17305e;margin-top:10px;">
        <b>每月總存入：</b>${retFmt(Math.round(D.policyMonthly))} 元 → 退休時預估解約金 <b style="color:#1a8f5a;">${retFmt(D.svR)}</b> 元
      </div>
    </div>
    <div style="display:flex;gap:12px;margin-top:4px;">
      <button class="ret-back-btn" onclick="goStep(6)">← 返回上一步</button>
      <button class="ret-generate-btn" style="flex:1;" id="ret-gen-btn">產生退休財務計畫書 →</button>
    </div>
  </div>`;
}

function retBindInput() {
  const syncAndRender = () => {
    RS.clientName = document.getElementById('ret-name').value;
    RS.gender = document.getElementById('ret-gender').value;
    RS.currentAge = +document.getElementById('ret-age').value||30;
    RS.retirementAge = Math.max(+document.getElementById('ret-retire').value||65, RS.currentAge+1);
    RS.lifeExpectancy = +document.getElementById('ret-life').value||85;
    RS.monthlyExpense = +document.getElementById('ret-expense').value||30000;
    RS.preparedAmount = +document.getElementById('ret-prepared').value||0;
    RS.otherIncome = +document.getElementById('ret-other-income').value||0;
    // 假設投報率限制在 -20% ～ 20%（可為 0 或負值）；空白或非數字則維持原值
    const rr = parseFloat(document.getElementById('ret-return').value);
    if (Number.isFinite(rr)) RS.assumedReturn = Math.max(UNDEngine.ROR_MIN, Math.min(UNDEngine.ROR_MAX, rr));
    pushRetirementToQuick();   // 同步回快速試算頁與資產配息頁
    // 重繪會換掉整個表單：記住正在輸入的欄位，重繪後把游標放回去，避免每打一個字就跳出欄位
    const activeId = document.activeElement?.id;
    let caret = null;
    try { caret = document.activeElement?.selectionStart ?? null; } catch (e) {}
    retRender();
    const el = activeId && document.getElementById(activeId);
    if (el) {
      el.focus();
      // 數字欄位讀不到游標位置：暫時切成文字欄位，把游標放到最後面
      const pos = caret != null ? caret : String(el.value).length;
      try {
        if (el.type === 'number') { el.type = 'text'; el.setSelectionRange(pos, pos); el.type = 'number'; }
        else el.setSelectionRange(pos, pos);
      } catch (e) {}
    }
  };
  ['ret-name','ret-gender','ret-age','ret-retire','ret-life','ret-expense','ret-prepared','ret-other-income','ret-return'].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.oninput = el.onchange = syncAndRender; }
  });
  document.getElementById('ret-gen-btn').onclick = () => { RS.page='report'; retRender(); };
}

function retReportHTML() {
  const D = retCompute(RS);
  const tableRows = (D.opt||[]).filter((_,i)=>(i+1)%5===0||i===0||i===D.ri).map(r =>
    `<tr class="${r.year===D.workYears+1?'ret-retire-row':''}">
      <td style="text-align:center">${r.year}</td>
      <td style="text-align:center">${r.age}</td>
      <td style="text-align:right">${retFmt(r.cum)}</td>
      <td style="text-align:right;color:#1d4ed8;font-weight:700">${retFmt(r.av)}</td>
      <td style="text-align:right;color:#15803d;font-weight:700">${retFmt(r.sv)}</td>
      <td style="text-align:right">${retFmt(r.db)}</td>
    </tr>`).join('');
  const lifeTotal = 100;
  const w1 = RS.currentAge, w2 = RS.retirementAge-RS.currentAge, w3 = RS.lifeExpectancy-RS.retirementAge, w4 = lifeTotal-RS.lifeExpectancy;
  return `
  <div id="ret-report-wrap" class="ret-rpt">
    <div class="ret-back-row">
      <button class="ret-back-btn" onclick="RS.page='input';retRender()">◀ 返回修改</button>
      <button class="ret-income-btn" onclick="document.getElementById('m-income-preview').classList.add('open')">
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18M3 6h18M3 18h18M7 3v18M17 3v18"/></svg>
        <span>每月成交收入表</span>
      </button>
      <button class="ret-pdf-btn" id="ret-pdf-btn">
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
        <span id="ret-pdf-label">儲存為 PDF</span>
      </button>
    </div>

    <div style="display:flex;align-items:center;gap:20px;margin-bottom:16px;">
      <div style="flex:1">
        <h1 class="lantin" style="font-size:2rem;line-height:1.1;margin:0 0 4px;">退休財務計畫書</h1>
        <div class="lantin" style="font-size:1.1rem;color:#555;">${RS.clientName||'客戶名稱'}</div>
      </div>
    </div>

    <table style="margin-bottom:12px;">
      <tbody>
        <tr>
          <td style="background:#f9fafb;font-weight:700;width:25%;text-align:center;">目前年齡</td>
          <td style="font-weight:700;text-align:center;width:25%">${RS.currentAge}歲</td>
          <td style="background:#f9fafb;font-weight:700;text-align:center;width:25%">預計退休年齡</td>
          <td style="font-weight:700;text-align:center;width:25%">${RS.retirementAge}歲</td>
        </tr>
        <tr>
          <td style="background:#f9fafb;font-weight:700;text-align:center;">預計退休花費</td>
          <td style="font-weight:700;text-align:center;">${D.expW}萬 / 月</td>
          <td style="background:#f9fafb;font-weight:700;text-align:center;">已準備退休金</td>
          <td style="font-weight:700;text-align:center;">${RS.preparedAmount>0?retFmt(RS.preparedAmount):'—'}</td>
        </tr>
      </tbody>
    </table>

    <!-- 人生時間軸 -->
    <div style="margin-bottom:16px;">
      <div style="display:flex;font-size:11px;color:#6b7280;font-weight:700;margin-bottom:4px;">
        <div style="width:${w1}%;text-align:center">目前年紀</div>
        <div style="width:${w2}%;text-align:center">預計剩餘工作時間</div>
        <div style="width:${w3}%;text-align:center">退休生活時間</div>
        <div style="width:${w4}%;text-align:center">超越平均餘命</div>
      </div>
      <div class="ret-lifebar">
        <div class="ret-lifebar-seg" style="width:${w1}%;background:#E2D3B9">${w1}年</div>
        <div class="ret-lifebar-seg" style="width:${w2}%;background:#CBA7AB">${w2}年</div>
        <div class="ret-lifebar-seg" style="width:${w3}%;background:#B2C7BB">${w3}年</div>
        <div class="ret-lifebar-seg" style="width:${w4}%;background:#8C9FB4">${w4}年</div>
      </div>
    </div>

    <!-- 方案比較 -->
    <table style="margin-bottom:16px;">
      <thead><tr><th style="width:50%">退休方案一</th><th style="width:50%">退休方案二</th></tr></thead>
      <tbody>
        <tr>
          <td style="text-align:center">準備好退休金，每個月花存款 ${D.expW} 萬元</td>
          <td style="text-align:center">打造月配息每個月領 ${D.expW} 萬元</td>
        </tr>
        <tr>
          <td style="text-align:center">需準備：${D.expW}萬 × 12個月 × ${D.retireYears}年 ＝ <span style="color:#dc2626;font-weight:900;font-size:1.1em">${D.needW}萬</span>${D.selfNeed<D.totalNeed?`<div style="font-size:11px;color:#d97706;margin-top:4px">扣除已準備資產後，需再存 ${retFmt(Math.round(D.selfNeed/10000))} 萬</div>`:''}</td>
          <td style="text-align:center">需準備：月配息保單 7%<span style="color:#1d4ed8;font-weight:900;font-size:1.1em">（約${D.capW}萬）</span>${RS.preparedAmount>0?`<div style="font-size:11px;color:#d97706;margin-top:4px">已扣除已準備退休金每月 ${retFmt(Math.round(D.preparedMonthly))} 元</div>`:''}</td>
        </tr>
        <tr>
          <td style="text-align:center;background:#f9fafb;font-weight:700">自己存</td>
          <td style="text-align:center;background:#f9fafb;font-weight:700">月配息保單規劃方案</td>
        </tr>
        <tr>
          <td style="text-align:center;padding:16px"><div style="margin-bottom:4px">每年存下：${retFmt(Math.round(D.selfAnnual))}</div><div style="color:#dc2626;font-weight:900;font-size:1.1em">每月存下：${retFmt(Math.round(D.selfMonthly))}</div></td>
          <td style="text-align:center;padding:16px"><div style="margin-bottom:4px">每年存下：${retFmt(D.policyAnnual)}</div><div style="color:#1d4ed8;font-weight:900;font-size:1.1em">每月存下：${retFmt(Math.round(D.policyMonthly))}</div></td>
        </tr>
      </tbody>
    </table>

    <!-- 保單明細 + 配息 -->
    <div style="display:flex;gap:16px;margin-bottom:16px;">
      <div style="flex:0 0 65%;background:linear-gradient(to bottom right,#eff6ff,#f8faff);border-radius:16px;padding:20px;border:1px solid #bfdbfe;">
        <div style="font-size:15px;font-weight:900;color:#1e3a5f;margin-bottom:4px;">退休規劃方案明細</div>
        <div style="font-size:11px;color:#6b7280;margin-bottom:12px;">年目標保費 ${retFmt(D.annualTarget)} ｜月超額保費 ${retFmt(D.monthlyExtra)} ｜壽險保額 ${D.saWan}萬 ｜假設投報率 ${RS.assumedReturn}%</div>
        <table>
          <thead><tr><th>年度</th><th>年齡</th><th>累計投入</th><th>帳戶價值</th><th>解約金</th><th>身故保障</th></tr></thead>
          <tbody>${tableRows}</tbody>
        </table>
      </div>
      <div style="flex:1;display:flex;flex-direction:column;gap:14px;">
        <div style="background:linear-gradient(to bottom right,#f0fdf4,#ecfdf5);border-radius:16px;padding:18px;border:1px solid #bbf7d0;">
          <div style="font-size:14px;font-weight:900;color:#1e3a5f;margin-bottom:4px;">退休後月配息試算</div>
          <div style="font-size:11px;color:#6b7280;margin-bottom:12px;">以退休時解約金 ${retFmt(D.svR)} 元<br>按年配息率 7% 試算</div>
          <div style="background:white;border-radius:10px;padding:10px;text-align:center;margin-bottom:8px;box-shadow:0 2px 8px rgba(0,0,0,.06);">
            <div style="font-size:11px;color:#9ca3af;margin-bottom:4px">退休時解約金</div>
            <div style="font-size:14px;font-weight:800;color:#1e3a5f">${retFmt(D.svR)}</div>
          </div>
          <div style="background:white;border-radius:10px;padding:10px;text-align:center;margin-bottom:8px;box-shadow:0 2px 8px rgba(0,0,0,.06);">
            <div style="font-size:11px;color:#9ca3af;margin-bottom:4px">每月配息金額</div>
            <div style="font-size:1.3em;font-weight:900;color:#16a34a">${retFmt(D.monthDist)}</div>
          </div>
          <div style="background:white;border-radius:10px;padding:10px;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,.06);">
            <div style="font-size:11px;color:#9ca3af;margin-bottom:4px">年度總配息</div>
            <div style="font-size:13px;font-weight:800;color:#16a34a">${retFmt(D.monthDist*12)}</div>
          </div>
        </div>
        <div style="font-size:11px;color:#9ca3af;text-align:center;line-height:1.7">⚠ 本計畫書僅供參考試算，實際保單利益以壽險公司正式建議書為準。假設投資報酬率不代表未來實際報酬。</div>
      </div>
    </div>
  </div>`;
}

function retBindReport() {
  const btn = document.getElementById('ret-pdf-btn');
  if (!btn) return;
  // PDF 另外排版成 A4 直式兩頁（scripts/retirement-plan.js），不直接擷取畫面
  btn.onclick = () => GPRetirementPlan.exportPDF(btn);
}

// ── 進入 Step 7 時自動帶入資料並渲染 ──
const _retGoStep = goStep;
goStep = function(n) {
  _retGoStep(n);
  if (n === 7) {
    setTimeout(() => {
      try {
        RS.page = 'input';
        retGetDataFromMain();
        retRender();
      } catch (err) {
        console.error('[Step7] 退休規劃載入失敗：', err);
        const root = document.getElementById('retirement-app-root');
        if (root) {
          root.innerHTML = `
            <div style="padding:32px;text-align:center;">
              <div style="font-size:18px;font-weight:800;color:#c93f15;margin-bottom:8px;">退休規劃載入時發生錯誤</div>
              <div style="font-size:13px;color:#6d7a99;margin-bottom:16px;">${(err && err.message) || err}</div>
              <div style="font-size:12px;color:#7a90b8;">請按 F12 開啟主控台查看詳細錯誤訊息。</div>
            </div>`;
        }
      }
    }, 50);
  }
};
