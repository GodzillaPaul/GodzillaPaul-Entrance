// PFW 美好優退 — 商品設定
// 從 config.json 自動產生(包成 JS 讓 file:// 開瀏覽器也能用)
window.PFW_CONFIG =
{
  "code": "PFW",
  "name": "美好優退",
  "fullName": "富邦人壽美好優退外幣分紅終身保險",
  "currency": "USD",
  "engineType": "retirement_income",
  "keyPrefix": "PFW",

  "productVariants": [
    { "key": "PFWA06", "label": "50退", "retireAge": 50, "ageMax": 44 },
    { "key": "PFWB06", "label": "55退", "retireAge": 55, "ageMax": 49 },
    { "key": "PFWC06", "label": "60退", "retireAge": 60, "ageMax": 54 },
    { "key": "PFWD06", "label": "65退", "retireAge": 65, "ageMax": 59 },
    { "key": "PFWE06", "label": "70退", "retireAge": 70, "ageMax": 64, "default": true },
    { "key": "PFWF06", "label": "75退", "retireAge": 75, "ageMax": 69 }
  ],

  "periodOptions": [6],
  "periodLabels": { "6": "6 年期" },

  "ageRange": {
    "6": { "min": 0, "max": 69 }
  },

  "sumLimits": [
    { "ageMax": 15, "min": 0.5, "max":  60 },
    { "ageMax": 40, "min": 0.5, "max": 120 },
    { "ageMax": 69, "min": 0.5, "max": 200 }
  ],

  "discount": {
    "6": {
      "highAmount": [
        { "minSum":  8, "pct": 0.01 },
        { "minSum": 25, "pct": 0.02 },
        { "minSum": 65, "pct": 0.03 }
      ],
      "paymentMethod": 0.01,
      "cap": 0.04
    }
  },

  "modes": {
    "6": [
      {
        "key": "total",
        "label": "六年總存",
        "unit": "萬",
        "default": 100,
        "quickPicks": [50, 100, 300, 600]
      },
      {
        "key": "annual",
        "label": "年存",
        "unit": "萬/年",
        "default": 20,
        "quickPicks": [10, 20, 30, 50]
      },
      {
        "key": "retire",
        "label": "退休金年領",
        "unit": "萬/年",
        "default": 36,
        "quickPicks": [12, 24, 36, 60, 120]
      }
    ]
  },

  "columns": [
    { "key": "year",     "label": "年度" },
    { "key": "age",      "label": "年齡" },
    { "key": "paid_yr",  "label": "折扣後保費" },
    { "key": "paid_cum", "label": "折扣後總保費" },
    { "key": "surv_yr",  "label": "年度生存金" },
    { "key": "surv_pct", "label": "生存金%" },
    { "key": "surv_cum", "label": "累計生存金" },
    { "key": "death",    "label": "身故金" },
    { "key": "surr",     "label": "解約金" },
    { "key": "profit",   "label": "解約獲利" }
  ],

  "bonus": {
    "lucky": [
      { "period": 6, "minAnnualUsd": 12000, "pct": 2 }
    ],
    "wallet": [
      { "period": 6, "minAnnualUsd": 24000 }
    ],
    "walletAmount": 8000,
    "luckyContent": "<p style=\"font-size:13px;color:#555;margin-bottom:0.75rem\">以<strong>折扣後首期保費（美元）</strong>計算，外幣保單（富邦錢包掃碼繳費，分期繳）：</p><table class=\"info-table\"><tr><th>幣別</th><th>短年繳（2~5年）→ +1%</th><th>長年繳（6年以上）→ +2%</th></tr><tr><td>美元</td><td>≥ 24,000 元</td><td class=\"hl\">≥ 12,000 元</td></tr></table><div class=\"info-highlight\">⚠️ 信用卡需活動登錄：115/4/1 16:00 起 ～ 115/7/10 23:59 止，限量 10 萬名。<br>登錄方式：網路銀行/行動銀行【信用卡活動登錄/查詢】，或撥 02-8751-1313 按 777，再按 1，輸入活動代碼 <strong>0412</strong>。</div><p class=\"info-foot\">※ PFW 為 6 年期，折扣後保費美元 ≥ 12,000 即享加碼 2% 回饋。</p>",
    "walletContent": "<div class=\"info-highlight\">🎉 幸福金 8,000 元門檻（每戶限一次）</div><table class=\"info-table\"><tr><th>支付方式</th><th>幣別</th><th>躉繳</th><th>短年繳（2~5年）</th><th>長年繳（6年以上）</th></tr><tr><td>信用卡／簽帳金融卡</td><td>台幣</td><td class=\"na\">不適用</td><td>≥ 150 萬</td><td class=\"hl\">≥ 80 萬</td></tr><tr><td>富邦錢包掃碼</td><td>台幣</td><td>≥ 200 萬</td><td class=\"na\">不適用</td><td class=\"na\">不適用</td></tr><tr><td>富邦錢包掃碼</td><td>美元</td><td>≥ 60,000</td><td>≥ 45,000</td><td class=\"hl\">≥ 24,000</td></tr></table><div class=\"info-highlight\">💡 幸福金為刷卡金（使用期限至 116/8/31），預計繳款成功後 <strong>60 個工作天</strong>起陸續回饋。</div><p class=\"info-foot\">※ PFW 為 6 年期，折扣後保費美元 ≥ 24,000 即享幸福金 NT$8,000。</p>"
  }
}
;
