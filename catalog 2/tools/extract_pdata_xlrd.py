import json, sys, math
from pathlib import Path
import xlrd

CODE='PFJ'
TARGET_NAMES=['PA','EXP','DIE','CV','PV0','PVFB','PVFB0','_DIE2','PV','CV0','BONU','BONUDIE','BONUCV','SRV']

def clean(v):
    if v == '': return None
    if isinstance(v, float):
        if math.isnan(v): return None
        if abs(v-round(v)) < 1e-10: return int(round(v))
        return v
    return v

def ref_coords(name):
    refs = name.result.value
    if not refs: return None
    ref = refs[0]
    return ref.coords # (slo,shi,rlo,rhi,clo,chi), hi exclusive

def extract_rect(ws, coords, scalar=False):
    _,_,rlo,rhi,clo,chi = coords
    rows=[]
    for r in range(rlo, min(rhi, ws.nrows)):
        key = ws.cell_value(r, clo) if clo < ws.ncols else ''
        if not isinstance(key, str):
            if key == '': continue
            key = str(int(key)) if isinstance(key,float) and key.is_integer() else str(key)
        key=key.strip()
        if not key or key.startswith('Insurance') or key in ('0000','商品代號性別年齡'):
            continue
        vals=[clean(ws.cell_value(r,c)) if c < ws.ncols else None for c in range(clo+1, min(chi, ws.ncols))]
        if not key.startswith(CODE):
            continue
        rows.append((key, vals))
    if scalar:
        return {k: (vals[0] if vals else None) for k, vals in rows}
    return {k: vals for k, vals in rows}

def extract_gp(ws):
    out={}
    for r in range(ws.nrows):
        if ws.ncols <= 10: break
        k=ws.cell_value(r,9)
        v=ws.cell_value(r,10)
        if isinstance(k,str) and k.startswith(CODE) and v!='':
            out[k.strip()]=clean(v)
    return out

def main():
    src=Path(sys.argv[1]) if len(sys.argv)>1 else Path('raw/PFJ.xls')
    out=Path(sys.argv[2]) if len(sys.argv)>2 else Path('products/PFJ/tables.json')
    book=xlrd.open_workbook(str(src), formatting_info=False)
    ws=book.sheet_by_name('PDATA')
    names={n.name:n for n in book.name_obj_list}
    tables={}
    for nm in TARGET_NAMES:
        if nm not in names:
            tables[nm]={}
            print(f'{nm:8s}: missing')
            continue
        coords=ref_coords(names[nm])
        scalar=(nm=='CV0')
        tables[nm]=extract_rect(ws, coords, scalar=scalar)
        sample=next(iter(tables[nm].items()), None)
        if scalar:
            print(f'{nm:8s}: {len(tables[nm])} scalar keys sample={sample}')
        else:
            cols=len(sample[1]) if sample else 0
            print(f'{nm:8s}: {len(tables[nm])} keys cols={cols} sample={sample[0] if sample else None}')
    tables['GP']=extract_gp(ws)
    print(f'GP      : {len(tables["GP"])} keys sample={next(iter(tables["GP"].items()), None)}')
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(tables, ensure_ascii=False, separators=(',',':')), encoding='utf-8')
    print('wrote', out, out.stat().st_size/1024/1024, 'MB')

if __name__=='__main__': main()
