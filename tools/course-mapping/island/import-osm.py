"""Offline import of explicitly reviewed OSM extracts. Never infer missing holes.
Usage: python3 import-osm.py output.json extract.osm ... [--prefix WAY_ID_PREFIX]
Coordinates follow OSM golf=hole tee-to-green direction. ODbL attribution required.
"""
import sys,json,xml.etree.ElementTree as ET
args=sys.argv[1:];out=args.pop(0);prefix=''
if '--prefix' in args:i=args.index('--prefix');prefix=args[i+1];args=args[:i]
nodes={};ways={}
for file in args:
 root=ET.parse(file).getroot()
 nodes.update({n.attrib['id']:{'latitude':float(n.attrib['lat']),'longitude':float(n.attrib['lon'])} for n in root.findall('node')})
 ways.update({w.attrib['id']:w for w in root.findall('way')})
def tags(w):return {t.attrib['k']:t.attrib['v'] for t in w.findall('tag')}
def path(w):return [nodes[n.attrib['ref']] for n in w.findall('nd')]
def inside(p,ring):
 x,y=p['longitude'],p['latitude'];result=False
 for a,b in zip(ring,ring[1:]+ring[:1]):
  ax,ay=a['longitude'],a['latitude'];bx,by=b['longitude'],b['latitude']
  if (ay>y)!=(by>y) and x<(bx-ax)*(y-ay)/(by-ay)+ax:result=not result
 return result
greens=[(id,path(w)) for id,w in ways.items() if tags(w).get('golf')=='green' and all(n.attrib['ref'] in nodes for n in w.findall('nd'))]
holes=[]
for id,w in ways.items():
 t=tags(w)
 if t.get('golf')!='hole' or not id.startswith(prefix):continue
 if not t.get('ref','').isdigit():raise ValueError('Unnumbered hole '+id)
 h={'number':int(t['ref']),'par':int(t['par']) if t.get('par','').isdigit() else None,'path':path(w),'osmWayId':id}
 matches=[(gid,g) for gid,g in greens if inside(h['path'][-1],g)]
 if len(matches)==1:h.update(greenOsmWayId=matches[0][0],greenBoundary=matches[0][1])
 holes.append(h)
holes.sort(key=lambda h:h['number'])
assert len(holes) in (9,18) and [h['number'] for h in holes]==list(range(1,len(holes)+1)), 'Incomplete or duplicate routing'
open(out,'w').write(json.dumps(holes,indent=2)+'\n');print(out,len(holes),'holes;',sum('greenBoundary' in h for h in holes),'greens')
