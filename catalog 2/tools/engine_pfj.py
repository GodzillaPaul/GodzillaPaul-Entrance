import json, math
from pathlib import Path

def ceil_int(x): return math.ceil(x - 1e-12)
def round_half_up(x): return int(math.floor(x + 0.5))
def pad2(n): return f'{int(n):02d}'
def key(period, sex, age): return f'PFJ{pad2(period)}{pad2(sex)}{pad2(age)}'
def lookup(T, name, k, idx):
    arr=T.get(name,{}).get(k)
    if not arr or idx<0 or idx>=len(arr): return 0
    v=arr[idx]
    return 0 if v is None else v

def calc_discount(period, sum_w):
    pct=1 # payment method: 首期匯款 + 續期轉帳，系統預設 1%
    if sum_w >= 15: pct += 1
    return min(pct, 2)

def compute(T, sex=2, age=25, period=6, sum_w=10, bonus_kind=2):
    base=key(period,sex,age)
    rate=T['GP'][base]
    annual_orig=round_half_up(sum_w*rate)
    pct=calc_discount(period,sum_w)
    annual_disc=ceil_int(annual_orig*(100-pct)/100)
    max_y=110-age+1
    bonu_key=base+str(bonus_kind)
    # K and M / Z
    Ks=[]; Ms=[]; Zs=[]
    z=0
    for yr in range(1,max_y+1):
        idx=yr-1
        bonu = lookup(T,'BONU',bonu_key,idx)
        K = 0
        M = 0
        if yr != 1:
            t1 = ceil_int(sum_w * bonu)
            t2 = ceil_int(z * bonu / 10000)
            K = t1 + t2
            if yr < max_y:
                pvfb_next = lookup(T,'PVFB',base,yr)
                M = round_half_up(K * 10000 / pvfb_next) if pvfb_next else 0
        z += M
        Ks.append(K); Ms.append(M); Zs.append(z)
    K_max=Ks[max_y-1] if max_y-1 < len(Ks) else 0
    rows=[]
    for yr in range(1,max_y+1):
        idx=yr-1
        A=round_half_up(sum_w*lookup(T,'DIE',base,idx))
        B=round_half_up(sum_w*lookup(T,'CV',base,idx))
        D=ceil_int(sum_w*lookup(T,'BONUDIE',bonu_key,idx))
        E=ceil_int(sum_w*lookup(T,'BONUCV',bonu_key,idx))
        die2=lookup(T,'_DIE2',base,idx)
        pvfb0=lookup(T,'PVFB0',base,yr)
        Zi=Zs[idx]
        X=ceil_int(Zi*die2/10000)
        Y=ceil_int(Zi*pvfb0/10000)
        if yr>=max_y:
            X+=K_max; Y+=K_max
        paid_yr=annual_disc if yr<=period else 0
        paid_cum=annual_disc*min(yr,period)
        rows.append(dict(year=yr,age=age+yr-1,paid_yr=paid_yr,paid_cum=paid_cum,A=A,B=B,K=Ks[idx],M=Ms[idx],Z=Zs[idx],D=D,E=E,X=X,Y=Y,death=A+D+X,surr=B+E+Y))
    return dict(key=base,rate=rate,annual_orig=annual_orig,annual_disc=annual_disc,discount_pct=pct,max_y=max_y,rows=rows)

if __name__=='__main__':
    T=json.loads(Path('PFJ_work/products/PFJ/tables.json').read_text())
    r=compute(T)
    print(r['key'], r['rate'], r['annual_orig'], r['annual_disc'], r['max_y'])
    for y in [1,2,3,6,10,30,86]:
        row=r['rows'][y-1]
        print(y, row)
