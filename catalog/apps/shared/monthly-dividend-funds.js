(function (global) {
  'use strict';

  var funds = [
    { code: 'DSP5', name: 'DSP5（安聯收益成長 AM 美元）', shortName: '安聯收益成長 AM', rate: 0.055, nav: 8.5023, navDate: '2026-09-24', currency: 'USD', url: 'https://invest.fubonlife.com.tw/w/wb/wb02.djhtm?a=TLZ64-DSP5' },
    { code: 'NGB1', name: 'NGB1（高盛環球高收益 X 美元）', shortName: '高盛環球高收益 X', rate: 0.51, nav: 36.91, navDate: '2026-09-24', currency: 'USD', url: 'https://invest.fubonlife.com.tw/w/wb/wb02.djhtm?a=ANZ89-NGB1' },
    { code: 'NGB2', name: 'NGB2（高盛新興市場債 X 美元）', shortName: '高盛新興市場債 X', rate: 0.59, nav: 37.45, navDate: '2026-09-24', currency: 'USD', url: 'https://invest.fubonlife.com.tw/w/wb/wb02.djhtm?a=ANZA2-NGB2' },
    { code: 'FBD6', name: 'FBD6（富邦月月興利 VAKT）', shortName: '富邦月月興利 VAKT', rate: 0.0468, nav: 9.1024, navDate: '2026-09-24', currency: 'TWD', url: 'https://invest.fubonlife.com.tw/w/wr/cf02.djhtm?a=FBD6' },
    { code: 'ACE17', name: 'ACE17（聯博 美國成長 AP 美元）', shortName: '聯博 美國成長 AP', rate: 0.8322, nav: 73.66, navDate: '2026-09-24', currency: 'USD', url: 'https://invest.fubonlife.com.tw/w/wb/wb02.djhtm?a=ALBT8-ACE17' },
    { code: 'JFP11', name: 'JFP11（JPM 多重收益美元對沖 A 股穩定月配）', shortName: 'JPM 多重收益美元對沖 A 股穩定月配', rate: 0.685, nav: 73.72, navDate: '2026-09-22', rateDate: '2026-09-08', currency: 'USD', url: 'https://invest.fubonlife.com.tw/w/wb/wb02.djhtm?a=JFZN3-JFP11&product=VCCF', rateUrl: 'https://invest.fubonlife.com.tw/w/wb/wb05.djhtm?a=JFZN3-JFP11&product=VCCF', dynamicRate: true },
    { code: 'DST3', name: 'DST3（安聯 AI 收益成長 B 美元）', shortName: '安聯 AI 收益成長 B', rate: 0.088, nav: 12.77, navDate: '2026-09-24', currency: 'USD', url: 'https://invest.fubonlife.com.tw/w/wr/wr01.djhtm?a=ACDD154-DST3' },
    { code: 'ACC3', name: 'ACC3（聯博 多元資產收益 AI 美元）', shortName: '聯博 多元資產收益 AI', rate: 0.075, nav: 9.42, navDate: '2026-09-24', currency: 'USD', url: 'https://invest.fubonlife.com.tw/w/wr/wr02.djhtm?a=ACTI71-ACC3' }
  ];

  function cloneFunds() {
    return funds.map(function (fund) { return Object.assign({}, fund); });
  }

  global.GP_MONTHLY_DIVIDEND = Object.freeze({
    version: '2026-09-24',
    googleSheetCsvUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTlWEVTc0tmVbJfFWoKfOIIjmFDeiBKCqQGtgflSfV280ul1EjXP-1UexQORI1dUt0cZsIQnKoQmJgp/pub?gid=971675466&single=true&output=csv',
    fundMarketApi: '/.netlify/functions/fund-market',
    officialCodes: ['JFP11'],
    fxRate: 31.7776,
    fxDate: '2026-09-24',
    funds: funds,
    cloneFunds: cloneFunds
  });
})(window);
