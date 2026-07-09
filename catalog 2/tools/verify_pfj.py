import xlrd, json, sys
from pathlib import Path
from engine_pfj import compute
T=json.loads(Path('PFJ_work/products/PFJ/tables.json').read_text())
r=compute(T, sex=2, age=25, period=6, sum_w=10, bonus_kind=2)
book=xlrd.open_workbook('PFJ_work/raw/PFJ.xls')
ws=book.sheet_by_name('總表_分紅_M')
cols=[('paid_yr',3),('paid_cum',4),('A',7),('B',8),('K',10),('M',12),('Z',13),('X',16),('Y',17),('death',22),('surr',23),('D',29),('E',30)]
mis=[]; total=0
for y,row in enumerate(r['rows'], start=1):
    rr=y+3
    for key,c in cols:
        ev=ws.cell_value(rr,c)
        if ev=='': ev=0
        ev=int(round(ev))
        av=row[key]
        total+=1
        if av!=ev:
            mis.append((y,key,av,ev))
print('key',r['key'],'rate',r['rate'],'disc',r['annual_disc'],'max_y',r['max_y'])
print('total',total,'mismatches',len(mis))
for m in mis[:30]: print(m)
