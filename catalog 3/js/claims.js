/* claims.js — GodzillaPaul 理賠案例庫資料與篩選 */
(function () {
  const claimCases = [
    { title:'常見理賠區', folder:'common', isFolder:true, categories:['medical','hospital','surgery','accident-medical','fracture','major','ltc'], tags:['#常見理賠','#案例專區'], summary:'先看最常遇到的理賠情境，從病名快速理解保險可能怎麼派上用場。', keywords:'常見理賠 案例 專區 剖腹產 息肉 鼻中隔 痔瘡 子宮疾病 子宮肌瘤 人工關節 意外 達文西 椎間盤 幼兒常見住院 幼兒 長照 重大傷病', url:'' },
    { title:'兒童相關', folder:'children', isFolder:true, categories:['medical','hospital','surgery','major'], tags:['#兒童','#住院醫療'], summary:'孩子常見疾病、住院、手術與父母最容易擔心的醫療費用情境。', keywords:'兒童 小孩 幼兒 幼兒常見住院 新生兒 住院 手術 發燒 肺炎 腸胃炎 腺病毒 腸病毒 RSV 玫瑰疹', url:'' },
    { title:'門診手術', folder:'outpatient', isFolder:true, categories:['medical','surgery'], tags:['#門診手術','#醫療實支'], summary:'不用住院也可能有費用壓力，門診手術、自費項目與實支實付怎麼看。', keywords:'門診手術 息肉 白內障 自費 醫療實支 手術定額', url:'' },
    { title:'婦女相關', folder:'women', isFolder:true, categories:['medical','hospital','surgery'], tags:['#婦女','#婦科'], summary:'生產、剖腹產、婦科疾病與住院手術相關案例。', keywords:'婦女 生產 剖腹產 子宮疾病 子宮肌瘤 卵巢囊腫 婦科', url:'' },
    { title:'意外相關', folder:'accident', isFolder:true, categories:['accident-medical','accident-hospital','fracture'], tags:['#意外實支','#意外住院'], summary:'車禍、跌倒、運動傷害等常見意外理賠情境。', keywords:'意外 車禍 跌倒 扭傷 撞傷 運動傷害 骨折', url:'' },
    { title:'癌症相關', folder:'cancer', isFolder:true, categories:['cancer','major','medical','hospital','surgery'], tags:['#癌症','#重大傷病'], summary:'癌症診斷、治療、住院、手術與重大傷病卡相關案例。', keywords:'癌症 惡性腫瘤 乳癌 肺癌 大腸癌 化療 標靶 重大傷病', url:'' },
    { title:'心臟相關', folder:'heart', isFolder:true, categories:['major','medical','hospital','surgery'], tags:['#心臟','#重大傷病'], summary:'心肌梗塞、心導管、支架與心臟手術等案例。', keywords:'心臟 心肌梗塞 心導管 支架 心律不整 心臟手術', url:'' },
    { title:'關節相關', folder:'joint', isFolder:true, categories:['medical','surgery','accident-medical','fracture'], tags:['#關節','#意外骨折'], summary:'手腳關節、韌帶、骨折、人工關節與相關手術費用。', keywords:'手腳 關節 韌帶 十字韌帶 半月板 人工關節 骨折', url:'' },
    { title:'生殖器相關', folder:'reproductive', isFolder:true, categories:['medical','surgery','hospital'], tags:['#生殖器官','#醫療實支'], summary:'婦科、泌尿與生殖器官相關治療案例。', keywords:'生殖器 子宮 卵巢 攝護腺 泌尿 婦科 手術', url:'' },
    { title:'身故理賠', folder:'death', isFolder:true, categories:['life'], tags:['#壽險','#身故'], summary:'身故理賠文件、受益人、傳承與稅源準備提醒。', keywords:'身故 壽險 受益人 傳承 遺產稅 死亡證明', url:'' },
    { title:'胸腹部臟器', folder:'organ', isFolder:true, categories:['medical','hospital','surgery','major'], tags:['#胸腹部','#醫療實支'], summary:'胸腔、腹部臟器疾病與手術住院案例。', keywords:'胸腔 肺 肝 胃 腸 腎 腹部 臟器 手術 住院', url:'' },
    { title:'國外收據', folder:'overseas', isFolder:true, categories:['medical','accident-medical'], tags:['#海外就醫','#收據'], summary:'出國就醫、海外收據與理賠文件準備情境。', keywords:'國外 海外 收據 就醫 旅平險 意外實支 醫療實支', url:'' },
    { title:'腰背部', folder:'back', isFolder:true, categories:['medical','surgery','accident-medical'], tags:['#腰背部','#醫療實支'], summary:'椎間盤、腰椎、脊椎與相關手術治療案例。', keywords:'腰背 椎間盤 腰椎 脊椎 復健 手術 醫療實支', url:'' },
    { title:'產險', folder:'property', isFolder:true, categories:['accident-medical','accident-hospital','fracture'], tags:['#產險','#意外'], summary:'產險、意外與特定事故相關理賠案例。', keywords:'產險 意外 傷害 車禍 旅平險 寵物險 責任險', url:'' },
    { title:'其他', folder:'other', isFolder:true, categories:['medical','hospital','surgery'], tags:['#其他案例','#補充情境'], summary:'無法直接歸類但客戶常問的理賠情境。', keywords:'其他 理賠 補充 案例 醫療 住院 手術', url:'' },

    { title:'剖腹產', series:'常見理賠案例 01', folder:'common women', categories:['medical','hospital','surgery'], tags:['#醫療實支','#住院定額','#手術定額'], summary:'生產遇到醫療必要時，住院、手術與相關費用都可能成為理賠重點。', keywords:'剖腹產 生產 胎位不正 婦女 住院 手術 醫療實支', url:'./claims/c-section/' },
    { title:'息肉切除', series:'常見理賠案例 02', folder:'common outpatient organ', categories:['medical','surgery'], tags:['#醫療實支','#手術定額'], summary:'息肉切除常見於門診或住院處置，重點在收據明細與手術項目。', keywords:'息肉 切除 大腸息肉 胃息肉 門診手術 手術定額 醫療實支', url:'./claims/polyps/' },
    { title:'鼻中隔', series:'常見理賠案例 03', folder:'common outpatient', categories:['medical','surgery','hospital'], tags:['#醫療實支','#手術定額'], summary:'鼻中隔手術常牽涉醫療必要性、自費項目與收據明細。', keywords:'鼻中隔 鼻中膈 鼻塞 耳鼻喉 手術 醫療實支', url:'./claims/nasal-septum/' },
    { title:'痔瘡', series:'常見理賠案例 04', folder:'common outpatient organ', categories:['medical','surgery','hospital'], tags:['#醫療實支','#手術定額'], summary:'常見手術也可能產生自費項目，保障不是只有大病才有感。', keywords:'痔瘡 痔瘡手術 肛門 手術 住院 醫療實支', url:'./claims/hemorrhoid/' },
    { title:'子宮疾病', series:'常見理賠案例 05', folder:'common women reproductive', categories:['medical','hospital','surgery'], tags:['#醫療實支','#住院定額','#手術定額'], summary:'子宮肌瘤、息肉、子宮切除與海扶刀等婦科治療，從症狀、收據到理賠結果一次看懂。', keywords:'子宮疾病 子宮肌瘤 子宮息肉 子宮切除 海扶刀 海芙刀 婦科 婦女 手術 住院 醫療實支 生殖器', url:'./claims/uterus-disorders/' },
    { title:'人工關節', series:'常見理賠案例 06', folder:'common joint', categories:['medical','surgery','hospital'], tags:['#醫療實支','#手術定額'], summary:'人工關節常有自費醫材，保障額度是否足夠，客戶看案例最有感。', keywords:'人工關節 關節 醫材 自費醫材 手術 醫療實支', url:'./claims/artificial-joint/' },
    { title:'意外受傷', series:'常見理賠案例 07', folder:'common accident', categories:['accident-medical','accident-hospital','fracture'], tags:['#意外實支','#意外住院','#意外骨折'], summary:'跌倒、車禍、運動傷害等情境，可快速理解意外保障的啟動方式。', keywords:'意外受傷 車禍 跌倒 運動傷害 骨折 意外實支 意外住院', url:'./claims/accidental-injury/' },
    { title:'達文西手術', series:'常見理賠案例 08', folder:'common outpatient organ', categories:['medical','surgery','cancer'], tags:['#醫療實支','#手術定額','#癌症'], summary:'高額自費手術最能看出醫療實支額度差異，也是客戶最容易有感的案例。', keywords:'達文西 達文西手術 自費手術 微創 癌症 醫療實支 達文西機械手臂', url:'./claims/da-vinci/' },
    { title:'椎間盤', series:'常見理賠案例 09', folder:'common back', categories:['medical','surgery','accident-medical'], tags:['#醫療實支','#手術定額'], summary:'椎間盤治療可能橫跨復健、手術與自費項目，適合拿來做保障檢查。', keywords:'椎間盤 椎間盤突出 腰椎 脊椎 腰背 手術 醫療實支 退化 破裂 神經壓迫', url:'./claims/intervertebral-disc/' },
    { title:'幼兒常見住院', series:'常見理賠案例 10', folder:'common children', categories:['medical','hospital'], tags:['#醫療實支','#住院定額'], summary:'幼兒常見疾病住院，最能讓父母理解醫療保障不是大人才需要。', keywords:'幼兒常見住院 幼兒 兒童 小孩 腺病毒 腸病毒 抽搐痙攣 熱性痙攣 RSV 支氣管炎 玫瑰疹 流感 發燒 住院 醫療實支', url:'./claims/children-hospitalized/' },
    { title:'長照／失能', series:'常見理賠案例 11', folder:'common ltc', categories:['ltc','major','medical'], tags:['#長照失能','#重大傷病'], summary:'當照護時間拉長，重點不只是醫療費，而是長期照顧與家庭現金流壓力。', keywords:'長照 失能 失智 巴氏量表 看護 照護 重大傷病', url:'./claims/long-term-care/' }
  ];

  const grid = document.getElementById('claimGrid');
  const input = document.getElementById('searchInput');
  const protectButtons = [...document.querySelectorAll('.protection-seg button')];
  const folderButtons = [...document.querySelectorAll('.folder-seg button')];
  const empty = document.getElementById('emptyState');
  const count = document.getElementById('caseCount');
  let activeType = 'all';
  let activeFolder = 'all';

  function escapeHtml(str) {
    return String(str || '').replace(/[&<>'"]/g, function (m) {
      return ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'})[m];
    });
  }

  function renderCards() {
    grid.innerHTML = claimCases.map(function (item, index) {
      const hasUrl = Boolean(item.url);
      const tagHtml = item.tags.map(function (tag) { return '<span class="claim-tag">' + escapeHtml(tag) + '</span>'; }).join('');
      const categoryData = item.categories.join(' ');
      const keywords = [item.title, item.series || '', item.summary, item.tags.join(' '), item.keywords].join(' ');
      const wrapperTag = hasUrl ? 'a' : 'article';
      const href = hasUrl ? ' href="' + escapeHtml(item.url) + '" target="_blank" rel="noopener"' : '';
      const placeholderClass = hasUrl ? '' : ' is-placeholder';
      const folderClass = item.isFolder ? ' is-folder' : '';
      const status = item.isFolder ? '案例專區' : (item.series || '理賠案例');
      const badge = item.isFolder ? String(index + 1).padStart(2, '0') : (item.series || '').replace('常見理賠案例 ', '');
      const ctaText = item.isFolder ? '查看這個專區' : (hasUrl ? '打開理賠案例' : '案例連結待補');
      const arrow = item.isFolder ? '→' : (hasUrl ? '→' : '+');
      return '<' + wrapperTag + ' class="claim-card' + placeholderClass + folderClass + '" data-folder="' + escapeHtml(item.folder) + '" data-categories="' + escapeHtml(categoryData) + '" data-keywords="' + escapeHtml(keywords) + '"' + href + '>' +
        '<div class="claim-top"><span class="claim-badge">' + escapeHtml(badge) + '</span><span class="claim-status">' + escapeHtml(status) + '</span></div>' +
        '<div class="claim-title">' + escapeHtml(item.title) + '</div>' +
        '<div class="claim-desc">' + escapeHtml(item.summary) + '</div>' +
        '<div class="claim-tags">' + tagHtml + '</div>' +
        '<div class="claim-cta"><span class="claim-cta-text">' + escapeHtml(ctaText) + '</span><span class="claim-arrow">' + escapeHtml(arrow) + '</span></div>' +
      '</' + wrapperTag + '>';
    }).join('');
  }

  function folderMatch(card, hasSearch) {
    const folders = (card.dataset.folder || '').split(' ');
    if (hasSearch) return true;
    if (activeFolder === 'all') return card.classList.contains('is-folder');
    if (card.classList.contains('is-folder')) return false;
    return folders.includes(activeFolder);
  }

  function applyFilter() {
    const q = (input.value || '').trim().toLowerCase();
    const hasSearch = Boolean(q);
    const cards = [...document.querySelectorAll('.claim-card')];
    let shown = 0;
    cards.forEach(function (card) {
      const categories = (card.dataset.categories || '').split(' ');
      const okFolder = folderMatch(card, hasSearch);
      const okType = activeType === 'all' || categories.includes(activeType);
      const okText = !q || (card.dataset.keywords || '').toLowerCase().includes(q);
      const show = okFolder && okType && okText;
      card.style.display = show ? 'flex' : 'none';
      if (show) shown++;
    });
    empty.style.display = shown ? 'none' : 'block';
    if (count) count.textContent = shown + (activeFolder === 'all' && !hasSearch ? ' 個案例專區' : ' 個理賠案例');
  }

  protectButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      protectButtons.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      activeType = btn.dataset.filter;
      applyFilter();
    });
  });
  folderButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      folderButtons.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      activeFolder = btn.dataset.folder;
      applyFilter();
    });
  });
  input.addEventListener('input', applyFilter);
  grid.addEventListener('click', function (event) {
    const card = event.target.closest('.claim-card.is-folder');
    if (!card) return;
    const folder = (card.dataset.folder || '').split(' ')[0];
    const btn = folderButtons.find(function (b) { return b.dataset.folder === folder; });
    if (btn) btn.click();
    document.getElementById('claims').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  renderCards();
  applyFilter();
})();
