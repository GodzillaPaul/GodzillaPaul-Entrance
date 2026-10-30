(function (global) {
  'use strict';

  var funds = [
    { code: 'DSP5', name: 'DSP5（安聯收益成長 AM 美元）', shortName: '安聯收益成長 AM', rate: 0.055, nav: 8.4184, navDate: '2026-10-09', rateDate: '2026-09-14', currency: 'USD', url: 'https://invest.fubonlife.com.tw/funds/overview/WFUND/25/DSP5', dynamicRate: true },
    { code: 'NGB1', name: 'NGB1（高盛環球高收益 X 美元）', shortName: '高盛環球高收益 X', rate: 0.51, nav: 35.63, navDate: '2026-10-09', rateDate: '2026-10-01', currency: 'USD', url: 'https://invest.fubonlife.com.tw/funds/overview/WFUND/32/NGB1', dynamicRate: true },
    { code: 'NGB2', name: 'NGB2（高盛新興市場債 X 美元）', shortName: '高盛新興市場債 X', rate: 0.59, nav: 36, navDate: '2026-10-09', rateDate: '2026-10-01', currency: 'USD', url: 'https://invest.fubonlife.com.tw/funds/overview/WFUND/32/NGB2', dynamicRate: true },
    { code: 'FBD6', name: 'FBD6（富邦月月興利 VAKT）', shortName: '富邦月月興利 VAKT', rate: 0.0468, nav: 9.118, navDate: '2026-10-07', rateDate: '2026-09-10', currency: 'TWD', url: 'https://invest.fubonlife.com.tw/funds/overview/DIA/45/FBD6', dynamicRate: false },
    { code: 'ACE17', name: 'ACE17（聯博 美國成長 AP 美元）', shortName: '聯博 美國成長 AP', rate: 0.8322, nav: 73.81, navDate: '2026-10-09', rateDate: '2026-09-29', currency: 'USD', url: 'https://invest.fubonlife.com.tw/funds/overview/WFUND/40/ACE17', dynamicRate: true },
    { code: 'JFP11', name: 'JFP11（JPM 多重收益美元對沖 A 股穩定月配）', shortName: 'JPM 多重收益美元對沖 A 股穩定月配', rate: 0.609, nav: 72.52, navDate: '2026-10-09', rateDate: '2026-10-07', currency: 'USD', url: 'https://invest.fubonlife.com.tw/funds/overview/WFUND/39/JFP11', dynamicRate: true },
    { code: 'DST3', name: 'DST3（安聯 AI 收益成長 B 美元）', shortName: '安聯 AI 收益成長 B', rate: 0.088, nav: 12.67, navDate: '2026-10-08', rateDate: '2026-09-24', currency: 'USD', url: 'https://invest.fubonlife.com.tw/funds/overview/FUND/10/DST3', dynamicRate: true },
    { code: 'ACC3', name: 'ACC3（聯博 多元資產收益 AI 美元）', shortName: '聯博 多元資產收益 AI', rate: 0.075, nav: 9.23, navDate: '2026-10-08', rateDate: '2026-09-29', currency: 'USD', url: 'https://invest.fubonlife.com.tw/funds/overview/FUND/20/ACC3', dynamicRate: true },
    { code: 'SCP6', name: 'SCP6（施羅德環球收益成長 A 美元月配固定 2）', shortName: '施羅德環球收益成長 A 月配', rate: 1.175936, nav: 134.9193, navDate: '2026-10-29', rateDate: '2026-09-23', currency: 'USD', url: 'https://invest.fubonlife.com.tw/funds/overview/WFUND/29/SCP6', dynamicRate: true }
  ];

  function cloneFunds() {
    return funds.map(function (fund) { return Object.assign({}, fund); });
  }

  // Refresh while the calculator stays open, and when returning to its tab.
  function startMarketRefresh(callback) {
    var lastAttempt = Date.now();
    function check() {
      if (document.hidden || Date.now() - lastAttempt < 30 * 60 * 1000) return;
      lastAttempt = Date.now();
      callback();
    }
    global.setInterval(check, 60 * 1000);
    document.addEventListener('visibilitychange', check);
  }

  global.GP_MONTHLY_DIVIDEND = Object.freeze({
    version: '2026-10-30',
    googleSheetCsvUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTlWEVTc0tmVbJfFWoKfOIIjmFDeiBKCqQGtgflSfV280ul1EjXP-1UexQORI1dUt0cZsIQnKoQmJgp/pub?gid=971675466&single=true&output=csv',
    fundMarketApi: '/.netlify/functions/fund-market',
    officialCodes: funds.map(function (fund) { return fund.code; }),
    fxRate: 32.3061,
    fxDate: '2026-10-15',
    funds: funds,
    startMarketRefresh: startMarketRefresh,
    cloneFunds: cloneFunds
  });
})(window);
