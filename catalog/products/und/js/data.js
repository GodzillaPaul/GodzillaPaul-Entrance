/* ══════════════════════════════════════
   data.js — 由共用引擎 apps/shared/und-engine.js 取得費率表與常數
   ══════════════════════════════════════ */

const {
  COI_M, COI_F, MULT_M, MULT_F, BASE_FEE, PAYWAY_DISC,
  PAYWAY_FIRST_DISC, PAYWAY_RENEW_DISC, MAX_AGE_BY_TYPE, LAST_INSURE_AGE,
  SA_HARD_MIN, SA_HARD_MAX, PREMIUM_CUM_MAX, CHILD_TARGET, EXCESS_TARGET_MULT, ROR_MIN, ROR_MAX,
  getMult, calcMinSA, calcMaxSA, getHighFeeDiscount, getSAThreshold, canPayPremium
} = UNDEngine;
const getSingleFeeRate = UNDEngine.getExcessFeeRate;
