import sys, json, os
G2 = sys.argv[1]
sys.path.insert(0, G2)
import generar_planos_02 as g
out = {}
for T in (10.0, 9.5, 12.0):
    p = dict(g.P); p["T"] = T
    pieces, battens = g.build_pieces(p)
    wood = [dict(ref=i.ref, name=i.name, box=[i.lo[0], i.hi[0], i.lo[1], i.hi[1], i.lo[2], i.hi[2]]) for i in g.wood_items(p)]
    pcs = [dict(ref=pc["ref"], name=pc["name"], l=pc["l"], a=pc["a"], g=pc["g"], holes=[list(h) for h in pc["holes"]], slot=pc["slot"]) for pc in pieces]
    bts = [dict(ref=b["ref"], qty=b["qty"], l=b["l"]) for b in battens]
    out[str(T)] = dict(wood=wood, pieces=pcs, battens=bts, G=g.G(p), zc=g.zc(p), cable=g.cable_path(p), n_screws=len(g.screws(p)))
json.dump(out, open(sys.argv[2], "w"), indent=1)
print("ok")
