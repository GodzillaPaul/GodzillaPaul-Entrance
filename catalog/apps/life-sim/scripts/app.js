// ============================================================
// Main application logic — originally at lines 5830-7201
// ============================================================

// ===== STATE =====
let u = { nickname:'', age:0, gender:'M', retire:60, income:0 };
let exp = {};
let baselineExp = null;
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
    const ret  = parseInt(document.getElementById('f-retire').value);
    const inc  = parseFloat(document.getElementById('f-income').value);

    if (!nick)              return alert('請輸入暱稱');
    if (!age||age<18||age>70) return alert('請輸入正確年齡（18-70歲）');
    if (!ret||ret<=age)     return alert('退休年齡必須大於目前年齡');
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

// ===== MODAL HELPERS =====
function openModal(cat) {
    document.getElementById('m-' + cat).classList.add('open');
    if (cat === 'retirement') onRetirementHousingChange();

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
            hint.textContent = '目前房貸 / 房租已帶入：' + exp.house.amount.toFixed(2) + ' 萬 / 月';
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
            const housingMode = document.getElementById('mr-housing-mode').value;
            let housing = 0;
            if (housingMode === 'link') housing = exp.house ? (exp.house.amount || 0) : 0;
            else if (housingMode === 'custom') housing = inputYuanToWan(document.getElementById('mr-housing-custom').value);
            const funRaw = document.getElementById('mr-fun').value;
            const travelRaw = document.getElementById('mr-travel').value;
            const careRaw = document.getElementById('mr-care').value;
            const fun = funRaw === 'custom' ? inputYuanToWan(document.getElementById('mr-fun-custom').value) : (+funRaw || 0);
            const travel = travelRaw === 'custom' ? inputYuanToWan(document.getElementById('mr-travel-custom').value) : (+travelRaw || 0);
            const care = careRaw === 'custom' ? inputYuanToWan(document.getElementById('mr-care-custom').value) : (+careRaw || 0);
            const retirementMonthlyNeed = life + housing + fun + travel + care;
            const retirementYears = Math.max(85 - u.retire, 0);
            const yearsToRetire = Math.max(u.retire - u.age, 1);
            const targetTotal = retirementMonthlyNeed * 12 * retirementYears;
            const monthlySavingNeed = targetTotal / (yearsToRetire * 12);
            amount = monthlySavingNeed;
            choice = '🏖️ 退休準備｜退休生活';
            label = `退休後每月${retirementMonthlyNeed.toFixed(2)}萬｜退休 ${retirementYears} 年需 ${targetTotal.toFixed(0)} 萬｜要在退休前 ${yearsToRetire} 年每月先存 ${monthlySavingNeed.toFixed(2)} 萬`;
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
    if (cat === 'retirement') {
        const life = +document.getElementById('mr-monthly').value || 0;
        const housingMode = document.getElementById('mr-housing-mode').value;
        let housing = 0;
        if (housingMode === 'link') housing = exp.house ? (exp.house.amount || 0) : 0;
        else if (housingMode === 'custom') housing = inputYuanToWan(document.getElementById('mr-housing-custom').value);
        const funRaw = document.getElementById('mr-fun').value;
        const travelRaw = document.getElementById('mr-travel').value;
        const careRaw = document.getElementById('mr-care').value;
        const fun = funRaw === 'custom' ? inputYuanToWan(document.getElementById('mr-fun-custom').value) : (+funRaw || 0);
        const travel = travelRaw === 'custom' ? inputYuanToWan(document.getElementById('mr-travel-custom').value) : (+travelRaw || 0);
        const care = careRaw === 'custom' ? inputYuanToWan(document.getElementById('mr-care-custom').value) : (+careRaw || 0);
        const retirementMonthlyNeed = life + housing + fun + travel + care;
        const retirementYears = Math.max(85 - u.retire, 0);
        exp[cat].targetMonthly = retirementMonthlyNeed;
        exp[cat].targetTotal = retirementMonthlyNeed * 12 * retirementYears;
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
    if (goToResult && !baselineExp) baselineExp = cloneExp(exp);

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
            ? `你設定的退休生活，代表退休後每月要 <strong>${formatYuanPerMonthFromWan(retirementMonthlyNeed)}</strong>，而且要在退休前 <strong>${yearsToRetire} 年</strong> 先存到 <strong>${formatYuanFromWan(retirementTargetTotal)}</strong>。`
            : '你剛剛填的每一項，不是想像，而是未來真實會發生的現金流。';
        noteEl.innerHTML = `你剛剛不是在填表，你是在替未來的自己選生活。<br>${retirementLine}`;
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
    if (!baselineExp) baselineExp = cloneExp(exp);
    baselineSummary = summarizeExp(baselineExp);
    currentSummary = summarizeExp(exp);

    const currentIncomeYuan = wanToYuan(u.income || 0);
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

    goStep(4);
}




// ===== RESTART =====
function restart() {
    exp = {};
    baselineExp = null;
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
    // Work income: use override if filled, else step1
    const workOverride = parseFloat(document.getElementById('inc-work-input')?.value) || 0;
    const workFromStep1 = Math.round((u.income || 0) * 10000);
    const workIncome = workOverride > 0 ? workOverride : workFromStep1;

    // Slash income: sum of items
    const slashIncome = slashItems.reduce((s, item) => s + item.amount, 0);

    // Invest income: 7% principal monthly + manual input (additive)
    const principal = parseFloat(document.getElementById('inc-invest-principal')?.value) || 0;
    const principalMonthly = Math.round(principal * 0.07 / 12);
    const manualInvest = parseFloat(document.getElementById('inc-invest-input')?.value) || 0;
    const investIncome = principalMonthly + manualInvest;

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

        let target = 0; // 單位：萬
        if (typeof exp !== 'undefined' && exp && exp.retirement) {
            target = exp.retirement.targetMonthly || 0;
        }
        const yuan = Math.round(target * 10000);

        if (yuan > 0) {
            amountEl.innerHTML = yuan.toLocaleString('zh-TW') + ' <span class="unit">元 / 月</span>';
            if (subEl) {
                subEl.innerHTML = '由你設定的 <b>生活費</b>、<b>娛樂費</b>、<b>旅行費</b>、<b>醫療費</b> 加總而得（約 ' + target.toFixed(2) + ' 萬 / 月）';
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
    if (retireEl && !retireEl.value) retireEl.value = Math.max(retire, age + 1);

    // 5. 退休月現金流（直接輸入每月投資收入）
    const investManual = parseFloat(document.getElementById('inc-invest-input')?.value) || 0;
    const cashflowEl = document.getElementById(prefix + '-cashflow');
    if (cashflowEl && !cashflowEl.value && investManual > 0) cashflowEl.value = investManual;

    // 6. 存款（可投資資金 / 投資本金）
    const principal = parseFloat(document.getElementById('inc-invest-principal')?.value) || 0;
    const savingsEl = document.getElementById(prefix + '-savings');
    if (savingsEl && !savingsEl.value && principal > 0) savingsEl.value = principal;
}

function s6RetCalc(which) {
    const prefix = which === 'yes' ? 's6y' : 's6n';
    const resultEl = document.getElementById(prefix + '-result');
    if (!resultEl) return;

    const age     = parseInt(document.getElementById(prefix + '-age')?.value) || 0;
    const retire  = parseInt(document.getElementById(prefix + '-retire')?.value) || 0;
    const cashflow= parseFloat(document.getElementById(prefix + '-cashflow')?.value) || 0;
    const savings = parseFloat(document.getElementById(prefix + '-savings')?.value) || 0;
    const gender  = document.getElementById(prefix + '-gender')?.value || 'M';

    if (!age || !retire || retire <= age) {
        resultEl.innerHTML = '<span style="color:#aaa;font-size:13px;">請填寫年齡與退休年齡</span>';
        return;
    }

    const fmt = n => Math.round(n).toLocaleString('zh-TW');
    const workYears  = retire - age;
    const retireYears = 85 - retire; // 預設平均餘命 85 歲

    // 退休需求試算
    // 月現金流缺口：若已有存款，先用 7% 年化換算每月配息扣除
    const savingsMonthly = Math.round(savings * 0.07 / 12);
    const netCashflow    = Math.max(cashflow - savingsMonthly, 0);

    // 方案一：自行存款所需總額
    const totalNeed   = cashflow * 12 * retireYears;
    // 方案二：月配息 7% 所需本金（扣除已有存款後的缺口本金）
    const capNeed     = netCashflow > 0 ? Math.round(netCashflow * 12 / 0.07) : 0;
    // 每月需自存金額（簡單平均，不含複利）
    const selfMonthly = workYears > 0 ? Math.round(totalNeed / workYears / 12) : 0;

    // 保單月存（用 retGoalSeek，若已引入）
    let policyMonthly = 0, svAtRetire = 0;
    if (typeof retGoalSeek === 'function' && capNeed > 0) {
        try {
            const S = { currentAge: age, retirementAge: retire, gender, assumedReturn: 0.06 };
            const ac = retGoalSeek(S, capNeed);
            policyMonthly = Math.round((ac.at + ac.me * 12) / 12);
            const ri = Math.min(workYears, (ac.res?.length || 1) - 1);
            svAtRetire = ac.res[ri]?.sv || 0;
        } catch(e) {}
    }

    let html = `
      <div class="ret-row">
        <span class="ret-label">工作年數 / 退休年數</span>
        <span class="ret-val">${workYears} 年 ／ ${retireYears} 年</span>
      </div>`;

    if (cashflow > 0) {
        html += `
      <div class="ret-row">
        <span class="ret-label">退休月現金流目標</span>
        <span class="ret-val blue">${fmt(cashflow)} 元 / 月</span>
      </div>`;
    }
    if (savings > 0) {
        html += `
      <div class="ret-row">
        <span class="ret-label">存款每月可配息（7%）</span>
        <span class="ret-val green">+${fmt(savingsMonthly)} 元 / 月</span>
      </div>
      <div class="ret-row">
        <span class="ret-label">尚需補足月現金流</span>
        <span class="ret-val ${netCashflow > 0 ? 'red' : 'green'}">${netCashflow > 0 ? fmt(netCashflow) + ' 元 / 月' : '已足夠 ✓'}</span>
      </div>`;
    }

    if (cashflow > 0) {
        html += `
      <div class="ret-row">
        <span class="ret-label">方案一｜需準備退休總金額</span>
        <span class="ret-val">${fmt(totalNeed)} 元</span>
      </div>
      <div class="ret-row">
        <span class="ret-label">方案一｜每月自存</span>
        <span class="ret-val red">${fmt(selfMonthly)} 元 / 月</span>
      </div>`;
    }

    if (capNeed > 0) {
        html += `
      <div class="ret-row">
        <span class="ret-label">方案二｜月配息所需本金（7%）</span>
        <span class="ret-val blue">${fmt(capNeed)} 元</span>
      </div>`;
        if (policyMonthly > 0) {
            html += `
      <div class="ret-row">
        <span class="ret-label">方案二｜保單月存</span>
        <span class="ret-val blue">${fmt(policyMonthly)} 元 / 月</span>
      </div>`;
        }
        if (svAtRetire > 0) {
            html += `
      <div class="ret-row">
        <span class="ret-label">退休時預估解約金</span>
        <span class="ret-val green">${fmt(svAtRetire)} 元</span>
      </div>`;
        }
    }

    if (!cashflow && !savings) {
        html = '<span style="color:#aaa;font-size:13px;">請填入退休月現金流或存款以開始試算</span>';
    }

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

// ── COI & SA tables (from retirement_preview.html) ──
const RET_COI_MALE={0:2.7e-5,1:1.6e-5,2:1.4e-5,3:1.2e-5,4:1e-5,5:1e-5,6:9e-6,7:9e-6,8:1e-5,9:1e-5,10:1e-5,11:1.1e-5,12:1.3e-5,13:1.5e-5,14:1.9e-5,15:2.5e-5,16:2.8e-5,17:3.2e-5,18:3.4e-5,19:3.6e-5,20:3.6e-5,21:3.7e-5,22:3.8e-5,23:3.9e-5,24:3.9e-5,25:4.1e-5,26:4.2e-5,27:4.3e-5,28:4.5e-5,29:4.7e-5,30:5.5e-5,31:5.8e-5,32:6.2e-5,33:6.7e-5,34:7.3e-5,35:8.1e-5,36:8.9e-5,37:9.7e-5,38:1.06e-4,39:1.16e-4,40:1.27e-4,41:1.39e-4,42:1.51e-4,43:1.64e-4,44:1.78e-4,45:2.01e-4,46:2.17e-4,47:2.34e-4,48:2.52e-4,49:2.71e-4,50:2.89e-4,51:3.1e-4,52:3.32e-4,53:3.56e-4,54:3.82e-4,55:4.22e-4,56:4.51e-4,57:4.84e-4,58:5.19e-4,59:5.57e-4,60:6.23e-4,61:6.68e-4,62:7.19e-4,63:7.74e-4,64:8.38e-4,65:9.39e-4,66:1.02e-3,67:1.112e-3,68:1.214e-3,69:1.33e-3,70:1.501e-3,71:1.604e-3,72:1.719e-3,73:1.861e-3,74:2.024e-3,75:2.257e-3,76:2.443e-3,77:2.649e-3,78:2.878e-3,79:3.133e-3,80:3.456e-3,81:3.766e-3,82:4.107e-3,83:4.486e-3,84:4.907e-3,85:5.418e-3,86:5.94e-3,87:6.518e-3,88:7.158e-3,89:7.867e-3,90:8.677e-3,91:9.565e-3,92:1.0555e-2,93:1.1651e-2,94:1.2867e-2,95:1.4214e-2,96:1.5704e-2,97:1.735e-2,98:1.917e-2,99:2.118e-2,100:2.341e-2,110:1};
const RET_COI_FEMALE={0:1.2e-5,1:7e-6,2:7e-6,3:6e-6,4:5e-6,5:4e-6,6:4e-6,7:4e-6,8:4e-6,9:4e-6,10:4e-6,11:4e-6,12:5e-6,13:5e-6,14:6e-6,15:7e-6,16:8e-6,17:8e-6,18:8e-6,19:9e-6,20:9e-6,21:9e-6,22:1e-5,23:1e-5,24:1e-5,25:1.1e-5,26:1.1e-5,27:1.1e-5,28:1.2e-5,29:1.2e-5,30:1.4e-5,31:1.5e-5,32:1.6e-5,33:1.7e-5,34:1.8e-5,35:1.9e-5,36:4e-5,37:4.2e-5,38:4.5e-5,39:4.8e-5,40:5.1e-5,41:5.4e-5,42:5.8e-5,43:6.2e-5,44:6.7e-5,45:7.3e-5,46:7.8e-5,47:8.4e-5,48:9e-5,49:9.7e-5,50:1.05e-4,51:1.13e-4,52:1.22e-4,53:1.32e-4,54:1.43e-4,55:1.58e-4,56:1.7e-4,57:1.84e-4,58:2e-4,59:2.17e-4,60:2.41e-4,61:2.6e-4,62:2.82e-4,63:3.07e-4,64:3.35e-4,65:4.67e-4,66:5.11e-4,67:5.6e-4,68:6.14e-4,69:6.75e-4,70:7.56e-4,71:8.16e-4,72:8.82e-4,73:9.64e-4,74:1.057e-3,75:1.19e-3,76:1.3e-3,77:1.424e-3,78:1.563e-3,79:1.72e-3,80:1.92e-3,81:2.115e-3,82:2.332e-3,83:2.574e-3,84:2.843e-3,85:3.174e-3,86:3.514e-3,87:3.893e-3,88:4.317e-3,89:4.792e-3,90:5.343e-3,110:1};
const RET_FFT={1:0.60,2:0.30,3:0.30,4:0.15,5:0.15};
const RET_FFE=0.05, RET_ADM=100, RET_MAX_MS=10000;
const RET_SA_M={0:[50,61.5],10:[42,61.5],16:[38,190],20:[35,190],25:[32,165],30:[29,140],35:[27,110],40:[24,85],45:[22,70],50:[19,60],55:[17,45],60:[15,30],65:[14,15],70:[12,15]};
const RET_SA_F={0:[57,61.5],10:[49,61.5],16:[43,240],20:[40,240],25:[37,210],30:[33,180],35:[30,145],40:[27,115],45:[25,85],50:[22,75],55:[20,55],60:[18,40],65:[17,25],70:[15,15]};

function retGetSAMult(g, age) {
  const t = g==='M' ? RET_SA_M : RET_SA_F;
  const keys = Object.keys(t).map(Number).sort((a,b)=>a-b);
  let k = keys[0];
  for (const kk of keys) { if (age >= kk) k = kk; else break; }
  return t[k];
}
function retCalcSA(g, age, ap) {
  const [lo,hi] = retGetSAMult(g, age);
  const avg = (lo+hi)/2;
  return Math.ceil(Math.min(60000000, avg*ap)/10000);
}
function retSimulate(p) {
  const coi = p.gender==='M' ? RET_COI_MALE : RET_COI_FEMALE;
  const months = Math.min(p.paymentYears*12, (110-p.currentAge)*12);
  const res = []; let av=0, cum=0;
  const mr = Math.pow(1+p.assumedReturn, 1/12)-1;
  for (let m=0; m<months; m++) {
    const yr=Math.floor(m/12)+1, mo=(m%12)+1, age=p.currentAge+yr-1;
    const tp = mo===1 ? p.annualTarget : 0, ep=p.monthlyExtra;
    const fr = RET_FFT[Math.min(yr,6)]||0;
    const fee = Math.round(tp*fr)+Math.round(ep*RET_FFE);
    cum += tp+ep;
    const adm = av>0||(tp+ep-fee)>0 ? RET_ADM : 0;
    const avMid = av+tp+ep-fee-adm;
    const coiRate = coi[Math.min(age,110)]||1;
    const coiCost = Math.round(Math.max(p.sumInsured-avMid,0)*coiRate);
    av = Math.max(avMid-coiCost,0)*(1+mr);
    if (mo===12||m===months-1) {
      const avR=Math.round(av), db=Math.max(p.sumInsured,avR);
      res.push({year:yr,age,av:avR,db,sv:avR,cum:Math.round(cum)});
    }
  }
  return res;
}
function retGoalSeek(S, capDist) {
  const workYears=S.retirementAge-S.currentAge, payYears=workYears+1, ar=S.assumedReturn/100;
  function trySV(tm) {
    const ms=Math.min(RET_MAX_MS,tm), me=Math.max(0,Math.round((tm-ms)/500)*500), at=ms*12;
    const sw=retCalcSA(S.gender,S.currentAge,at), si=sw*10000;
    const res=retSimulate({currentAge:S.currentAge,retirementAge:S.retirementAge,gender:S.gender,annualTarget:at,monthlyExtra:me,assumedReturn:ar,paymentYears:payYears,sumInsured:si});
    const idx=Math.min(workYears,(res?.length||1)-1);
    return {sv:res[idx]?.sv||0,ms,me,at,sw,si,res};
  }
  let lo=500,hi=200000,best=hi;
  for (let i=0;i<30;i++){const mid=Math.round((lo+hi)/2/500)*500;if(mid<=lo)break;if(trySV(mid).sv>=capDist){best=mid;hi=mid;}else lo=mid;}
  while(best>500){if(trySV(best-500).sv>=capDist)best-=500;else break;}
  return trySV(best);
}
function retCompute(S) {
  const workYears=S.retirementAge-S.currentAge, retireYears=S.lifeExpectancy-S.retirementAge;
  const totalNeed=S.monthlyExpense*retireYears*12, selfAnnual=workYears>0?totalNeed/workYears:0, selfMonthly=selfAnnual/12;
  const preparedMonthly=S.preparedAmount*0.07/12;
  const netMonthlyExpense=Math.max(0,S.monthlyExpense-preparedMonthly);
  const capDist=netMonthlyExpense*12/0.07;
  const ac=retGoalSeek(S,capDist);
  const ri=Math.min(workYears,(ac.res?.length||1)-1);
  const svR=ac.res[ri]?.sv||0, monthDist=svR*0.07/12;
  const policyAnnual=ac.at+ac.me*12, policyMonthly=policyAnnual/12;
  const expW=S.monthlyExpense/10000, needW=Math.round(totalNeed/10000), capW=Math.round(capDist/10000);
  return {workYears,retireYears,totalNeed,selfAnnual,selfMonthly,capDist,preparedMonthly,netMonthlyExpense,
    monthlySaving:ac.ms,monthlyExtra:ac.me,annualTarget:ac.at,saWan:ac.sw,sa:ac.si,opt:ac.res,ri,svR,monthDist,
    policyAnnual,policyMonthly,expW,needW,capW};
}
const retFmt = n => n==null?'-':Math.round(n).toLocaleString('zh-TW');

// ── State ──
const RS = {
  page:'input', clientName:'', gender:'M',
  currentAge:30, retirementAge:65, monthlyExpense:30000,
  lifeExpectancy:85, assumedReturn:6, preparedAmount:0
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
  // 5. 退休後每月目標花費
  //    ⚠ 要用 targetMonthly（退休後每月目標，如 5.30 萬），不要用 amount（amount 是「工作期間每月要存多少」的倒推值，如 4.4167 萬）
  let retirementExpense = 0;
  if (typeof exp !== 'undefined' && exp.retirement) {
    const target = exp.retirement.targetMonthly || 0; // 退休後每月目標（萬）
    retirementExpense = Math.round(target * 10000);
  }
  // 6. 扣除每月投資收入（第二格：直接輸入每月投資收入 + 本金 7% 配息）
  const investManual = parseFloat(document.getElementById('inc-invest-input')?.value) || 0;
  const investPrincipal = parseFloat(document.getElementById('inc-invest-principal')?.value) || 0;
  const investIncome = investManual + Math.round(investPrincipal * 0.07 / 12);
  // 退休每月需準備的金流 = 退休後目標金流 − 已有投資金流（不能為負）
  const netExpense = Math.max(retirementExpense - investIncome, 0);
  RS.monthlyExpense = netExpense > 0 ? netExpense : (retirementExpense > 0 ? retirementExpense : 30000);
  RS._workIncome = investIncome; // 供顯示用（沿用原有欄位名稱）
  // 7. 存款（投資本金）
  const principal = parseFloat(document.getElementById('inc-invest-principal')?.value) || 0;
  RS.preparedAmount = principal;
  // 記錄原始退休費用和薪資，供顯示
  RS._retirementRaw = retirementExpense;
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
  const hasDeduction = RS._retirementRaw > 0 && RS._workIncome > 0 && RS._retirementRaw > RS._workIncome;
  return `
  <div id="ret-input-wrap">
    <div class="ret-page-title">退休財務規劃</div>
    <div class="ret-page-sub">依你填寫的資料自動帶入，可直接微調後產生計畫書</div>
    ${hasDeduction ? `<div class="ret-note-box">💡 退休月現金流 ${retFmt(RS._retirementRaw)} 元已扣除薪資收入 ${retFmt(RS._workIncome)} 元，實際保單目標缺口為 <b>${retFmt(RS.monthlyExpense)} 元 / 月</b>。</div>` : ''}
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
        <div class="ret-field"><label>已準備退休金（元）</label><input type="number" class="ret-ic" id="ret-prepared" value="${RS.preparedAmount}" step="100000"></div>
      </div>
    </div>
    <div class="ret-section">
      <div class="ret-section-title">❸ 保單試算結果（自動）</div>
      ${RS.preparedAmount > 0 ? `<div style="background:#fffbea;border:1px solid #f0d88a;border-radius:10px;padding:10px 14px;font-size:12px;color:#7a5c10;margin-bottom:12px;">已準備退休金 ${retFmt(RS.preparedAmount)} 元，以 7% 年化換算每月可提供 <b>${retFmt(Math.round(D.preparedMonthly))}</b> 元，保單目標已自動扣除。</div>` : ''}
      <div class="ret-grid2">
        <div class="ret-field"><label>假設投報率 %</label><input type="number" class="ret-ic" id="ret-return" value="${RS.assumedReturn}" min="0" max="12" step="0.5"></div>
        <div class="ret-field"><label>需準備退休資金</label><div class="ret-ro">${retFmt(Math.round(D.capDist))}</div></div>
        <div class="ret-field"><label>月存金額</label><div class="ret-ro">${retFmt(D.monthlySaving)}${D.monthlySaving>=RET_MAX_MS?'<span style="color:#e85d4a;font-size:11px;margin-left:6px;">已達上限</span>':''}</div></div>
        <div class="ret-field"><label>年目標保費</label><div class="ret-ro">${retFmt(D.annualTarget)}</div></div>
        <div class="ret-field"><label>月超額保費</label><div class="ret-ro">${retFmt(D.monthlyExtra)}</div></div>
        <div class="ret-field"><label>基本保額（萬）</label><div class="ret-ro">${retFmt(D.saWan)}</div></div>
      </div>
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
    RS.assumedReturn = +document.getElementById('ret-return').value||6;
    retRender();
  };
  ['ret-name','ret-gender','ret-age','ret-retire','ret-life','ret-expense','ret-prepared','ret-return'].forEach(id => {
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
          <td style="text-align:center">需準備：${D.expW}萬 × 12個月 × ${D.retireYears}年 ＝ <span style="color:#dc2626;font-weight:900;font-size:1.1em">${D.needW}萬</span></td>
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

// 動態載入 CDN 腳本（若頁面初次載入時 onerror fallback 失敗，這裡再救一次）
function retLoadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Failed to load ' + src));
    document.head.appendChild(s);
  });
}

async function retEnsureLibs() {
  // html2canvas
  if (typeof html2canvas === 'undefined') {
    await retLoadScript('https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js');
  }
  // jsPDF
  if (typeof window.jspdf === 'undefined' || !window.jspdf.jsPDF) {
    await retLoadScript('https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js');
  }
  if (typeof html2canvas === 'undefined') throw new Error('html2canvas 無法載入，請檢查網路連線');
  if (typeof window.jspdf === 'undefined' || !window.jspdf.jsPDF) throw new Error('jsPDF 無法載入，請檢查網路連線');
}

function retBindReport() {
  const btn = document.getElementById('ret-pdf-btn');
  if (!btn) return;
  btn.onclick = async () => {
    const label = document.getElementById('ret-pdf-label');
    const origText = label ? label.textContent : '儲存為 PDF';
    btn.disabled = true;
    if (label) label.textContent = '載入中…';

    try {
      // ── 1. 確保兩個 CDN 腳本都已載入 ──
      await retEnsureLibs();
      const { jsPDF } = window.jspdf;

      // ── 2. 取得報表 DOM ──
      const wrapEl = document.getElementById('ret-report-wrap');
      if (!wrapEl) throw new Error('找不到報表內容（#ret-report-wrap）');

      // 暫時隱藏「返回」「PDF」按鈕列以免拍進去
      const navRow = wrapEl.querySelector('.ret-back-row');
      const prevNavDisplay = navRow ? navRow.style.display : null;
      if (navRow) navRow.style.display = 'none';

      // 暫時移除任何外層 transform 並讓 layout 穩定
      const prevT = wrapEl.style.transform;
      wrapEl.style.transform = 'none';

      if (label) label.textContent = '產生中…（請稍候）';

      // 等字型與圖片都 ready
      if (document.fonts && document.fonts.ready) {
        try { await document.fonts.ready; } catch (e) {}
      }
      await new Promise(r => setTimeout(r, 120));

      // ── 3. html2canvas 渲染（scale=2，避免超大 canvas 爆炸則降為 1.5） ──
      let canvas;
      try {
        canvas = await html2canvas(wrapEl, {
          scale: 2,
          useCORS: true,
          allowTaint: false,
          backgroundColor: '#ffffff',
          logging: false,
          windowWidth: wrapEl.scrollWidth,
          windowHeight: wrapEl.scrollHeight
        });
      } catch (inner) {
        console.warn('[PDF] scale=2 失敗，降級為 scale=1.5：', inner);
        canvas = await html2canvas(wrapEl, {
          scale: 1.5,
          useCORS: true,
          backgroundColor: '#ffffff',
          logging: false
        });
      }

      // 還原 UI
      if (navRow) navRow.style.display = prevNavDisplay || '';
      wrapEl.style.transform = prevT;

      if (!canvas || !canvas.width || !canvas.height) throw new Error('html2canvas 回傳空白畫布');

      // ── 4. 整份報表縮放到單張 A4 橫式 ──
      const PDF_W = 297, PDF_H = 210;          // A4 橫式 mm
      const MARGIN = 8;
      const contentW = PDF_W - MARGIN * 2;     // 可用寬度 (mm)
      const contentH = PDF_H - MARGIN * 2;     // 可用高度 (mm)

      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4', compress: true });
      const clientTag = (RS.clientName || '客戶').replace(/[\\/:*?"<>|]/g, '');

      // 以 contain 邏輯算出放進去後的尺寸：先試寬滿版，高超出就改高滿版
      let iW = contentW;
      let iH = (canvas.height / canvas.width) * contentW;
      if (iH > contentH) {
        iH = contentH;
        iW = (canvas.width / canvas.height) * contentH;
      }
      const x = MARGIN + (contentW - iW) / 2;
      const y = MARGIN + (contentH - iH) / 2;
      pdf.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', x, y, iW, iH);

      pdf.save('退休財務計畫書_' + clientTag + '.pdf');
      if (label) label.textContent = '✓ 已儲存';
      setTimeout(() => { if (label) label.textContent = origText; }, 1600);

    } catch (e) {
      console.error('[PDF export] 失敗：', e);
      const msg = (e && e.message) ? e.message : String(e);
      if (label) label.textContent = '失敗：請重試';
      // 顯示友善錯誤訊息
      try {
        alert('PDF 匯出失敗：\n' + msg + '\n\n請確認網路連線，或按 F12 查看詳細錯誤。');
      } catch (_) {}
      setTimeout(() => { if (label) label.textContent = '儲存為 PDF'; }, 2500);
    } finally {
      btn.disabled = false;
    }
  };
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
