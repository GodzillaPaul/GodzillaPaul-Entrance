window.PFN_CONFIG = {
  productCode: 'PFN',
  fullName: '富邦人壽紅運優外幣分紅終身保險',
  periodOptions: [10, 20],
  productVariants: [
    { key:'PFNA10', prod:'PFNA', period:10, label:'55退-10年', retireAge:55, ageMax:45 },
    { key:'PFNA20', prod:'PFNA', period:20, label:'55退-20年', retireAge:55, ageMax:35 },
    { key:'PFNB10', prod:'PFNB', period:10, label:'60退-10年', retireAge:60, ageMax:50 },
    { key:'PFNB20', prod:'PFNB', period:20, label:'60退-20年', retireAge:60, ageMax:40 },
    { key:'PFNC10', prod:'PFNC', period:10, label:'65退-10年', retireAge:65, ageMax:55 },
    { key:'PFNC20', prod:'PFNC', period:20, label:'65退-20年', retireAge:65, ageMax:45, default:true }
  ],
  sumLimits: [
    { ageMax: 15, max: 60 },
    { ageMax: 40, max: 120 },
    { ageMax: 99, max: 200 }
  ],
  discount: {
    '10': { highAmount:[{minSum:1,pct:0.01},{minSum:3,pct:0.02},{minSum:5,pct:0.03}], paymentMethod:0.01, cap:0.04 },
    '20': { highAmount:[{minSum:1,pct:0.01},{minSum:3,pct:0.02},{minSum:5,pct:0.03}], paymentMethod:0.01, cap:0.04 }
  },
  modes: {
    '10': [
      { key:'total', label:'10年總存', default:200, quick:[100,200,300,500] },
      { key:'annual', label:'年繳', default:20, quick:[10,20,30,50] },
      { key:'retire', label:'退休年領', default:3, quick:[2,3,5,8] }
    ],
    '20': [
      { key:'total', label:'20年總存', default:200, quick:[100,200,300,500] },
      { key:'annual', label:'年繳', default:10, quick:[5,10,15,20] },
      { key:'retire', label:'退休年領', default:3, quick:[2,3,5,8] }
    ]
  },
  columns: [
    { key:'year', label:'年度' },
    { key:'age', label:'年齡' },
    { key:'paid_yr', label:'當年保費' },
    { key:'paid_cum', label:'累計保費' },
    { key:'surv_yr', label:'生存金' },
    { key:'surv_pct', label:'生存金/累繳' },
    { key:'surv_cum', label:'累計生存金' },
    { key:'death', label:'身故保障' },
    { key:'surr', label:'解約金' }
  ],
  bonus: {
    lucky: [{period:10,minAnnualUsd:12000,pct:2},{period:20,minAnnualUsd:12000,pct:2}],
    wallet: [{period:10,minAnnualUsd:24000},{period:20,minAnnualUsd:24000}],
    walletAmount: 8000,
    luckyContent: '<p>外幣長年繳保單以富邦指定方式繳費，年繳保費達 USD 12,000，可試算加碼回饋 2%。實際活動資格仍以富邦活動辦法為準。</p>',
    walletContent: '<p>外幣長年繳保單年繳保費達 USD 24,000，並符合富邦錢包活動條件，可試算幸福金 NT$8,000。活動期限與資格以官方公告為準。</p>'
  }
};
