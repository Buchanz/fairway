"""Pilot routing digitized against municipal orthophotos and official numbered diagrams.
Coordinates reference visible tee pads, not surveyed or daily tee-marker locations.
Pixel controls below are retained so every generated point can be re-reviewed.
"""
import json
from pathlib import Path
root=Path(__file__).resolve().parents[3]
def build(id,extent,size,offset,paths,source,label):
 def point(p):
  x,y=p[0]+offset[0],p[1]+offset[1]
  return {'latitude':round(extent[3]-y/size[1]*(extent[3]-extent[1]),7),'longitude':round(extent[0]+x/size[0]*(extent[2]-extent[0]),7)}
 holes=[{'number':i,'par':None,'path':[point(p) for p in path],'pilot':True,'sourceUrl':source,'sourceLabel':label} for i,path in enumerate(paths,1)]
 (root/f'src/data/{id}-holes.json').write_text(json.dumps(holes,indent=2)+'\n')
# CRD Ortho MapServer export, bbox -123.470,48.630,-123.455,48.641,
# size 2000x1600. Use returned extent (aspect adjustment), not requested bbox.
# Official routing: ardmoregolfcourse.com/uploads/2/5/3/4/25345447/hole_layout.jpg
build('ardmore',[-123.47,48.6295,-123.455,48.6415],[2000,1600],[550,555],[
 [(555,350),(450,75)],
 [(415,28),(600,80),(660,130),(590,375)],
 [(817,360),(875,45)],
 [(950,40),(970,440)],
 [(884,460),(735,387)],
 [(380,395),(55,490)],
 [(30,465),(170,330),(145,207)],
 [(135,178),(315,152)],
 [(360,37),(496,442)],
], 'https://www.ardmoregolfcourse.com/our-course.html','Ardmore routing / CRD imagery · Pilot')
# Langley City Imagery2025 export, returned extent -122.631,49.0765,-122.621,49.0845.
# Official diagram is SOUTH-UP: 44th Ave is north; 216th St is east.
# Source: langleygolfcentre.com/golf-rates-and-online-bookings (2024 scorecard map).
build('langley-golf-centre',[-122.631,49.0765,-122.621,49.0845],[2000,1600],[260,500],[
 [(590,25),(285,20)],[(150,35),(180,160)],[(50,190),(40,370)],
 [(235,380),(240,570)],[(285,620),(85,680)],[(35,755),(270,770)],
 [(430,877),(420,694)],[(535,645),(780,545)],[(782,451),(820,265)],
 [(925,265),(870,466)],[(940,540),(860,820)],[(910,885),(585,883)],
 [(765,833),(780,630)],[(650,660),(514,793)],[(378,873),(70,816)],
 [(5,780),(30,496)],[(285,355),(355,191)],[(230,91),(520,90)],
], 'https://www.langleygolfcentre.com/golf-rates-and-online-bookings','Langley routing / City imagery · Pilot')
