"""Reviewed hole numbering from the official routing diagram; geometry from OSM.
Reference tees are polygon centroids, not colour-specific daily markers.
"""
import json,xml.etree.ElementTree as E
from pathlib import Path
root=Path(__file__).resolve().parents[3]
r=E.parse(Path(__file__).with_name('source.osm')).getroot()
nodes={n.get('id'):{'longitude':float(n.get('lon')),'latitude':float(n.get('lat'))} for n in r.findall('node')}
ways={w.get('id'):w for w in r.findall('way')}
def shape(short):
 matches=[(id,w) for id,w in ways.items() if id.endswith(short) and any(t.get('k')=='golf' and t.get('v') in ['tee','green'] for t in w.findall('tag'))]
 assert len(matches)==1,short
 id,w=matches[0];return id,[nodes[n.get('ref')] for n in w.findall('nd')]
def center(points):
 p=points[:-1] if points[0]==points[-1] else points
 return {k:sum(x[k] for x in p)/len(p) for k in ['latitude','longitude']}
# Explicitly reviewed against official course overview. No nearest-neighbour numbering.
pairs=[('6601','6611'),('6613','6618'),('6619','6623'),('6626','6632'),('6634','6645'),('8610','8615'),('8619','8621'),('8624','8629'),('8632','8635'),('0925','0929'),('0932','0937'),('0938','0939'),('0944','0947'),('0953','0951'),('9540','1808'),('1816','1819'),('1822','9538'),('1823','9534')]
# Tee pads reviewed against the official illustrated guides (holes 1–6).
tee_sets=[('6602','6601','6604'),('6613','6614','6615'),('6619','6620','6621'),('6626','6627','6629'),('6634','8588','8589'),('8611','8612','8613')]
pars=[5,4,3,4,5,4,3,4,4,4,4,5,4,3,4,3,5,4]
holes=[]
for number,(tee,green) in enumerate(pairs,1):
 tid,t=shape(tee);gid,g=shape(green)
 holes.append({'number':number,'par':pars[number-1],'path':[center(t),center(g)],'greenBoundary':g,'greenOsmWayId':gid,'teeOsmWayId':tid,'pilot':True,'sourceUrl':'https://www.duncanmeadows.com/the-course','sourceLabel':'Duncan Meadows routing / OpenStreetMap reference geometry'})
for h,pads,par in zip(holes,tee_sets,pars):
 h['teePositions']={color:center(shape(pad)[1]) for color,pad in zip(['blue','white','green'],pads)}
 h['path'][0]=h['teePositions']['blue']
 h['par']=par
(root/'src/data/duncan-meadows-holes.json').write_text(json.dumps(holes,indent=2)+'\n')
