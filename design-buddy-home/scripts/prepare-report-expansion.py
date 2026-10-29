"""Prepare authored reports plus fully inspectable deterministic synthetic datasets."""
import pathlib,json,csv,io,sys,os,collections,statistics
r=pathlib.Path(__file__).resolve().parents[1];sys.path.insert(0,str(r.parent/'.cache/expansion-python'))
from PIL import Image
specs=json.loads((r/'scripts/report-expansion-content.json').read_text())
def sources(id):
 if id=='evidence-review':
  kinds=['method-note','example-sheet','reflection','method-note','example-sheet','opinion','duplicate','out-of-scope'];reasons=['in-scope']*5+['unsupported-opinion','duplicate-card','outside-question']
  records=[dict(source_id=f'S{i+1:02d}',kind=k,included=i<5,reason=reasons[i],theme='clarity' if i in [0,1,3] else 'context' if i in [2,4] else 'excluded')for i,k in enumerate(kinds)]
  summary=dict(totalCards=8,included=5,excluded=3,methodNotes=2,exampleSheets=2,reflections=1);facts=[['SOURCE CARDS','8 invented / 5 included / 3 excluded'],['INCLUDED ROLES','2 method / 2 example / 1 reflection']]
 elif id=='experiment-readout':
  records=[]
  for group,completed,start,first in [('A',8,8,1),('B',9,7,13)]:
   for i in range(12):records.append(dict(task_id=f'T{first+i:02d}',condition=group,completed=i<completed,time_units=start+i if i<completed else None))
  summary=dict(total=24,perCondition=12,completedA=8,completedB=9,totalCompleted=17,meanCompletedA=11.5,meanCompletedB=11,medianCompletedA=11.5,medianCompletedB=11,timeUnit='arbitrary-teaching-unit');facts=[['COMPLETION MODEL','A: 8 / 12 · B: 9 / 12'],['COMPLETED-ONLY MEAN','A: 11.5 · B: 11.0 teaching units']]
 elif id=='operations-review':
  received=[40,44,39,48,46,51];closed=[36,42,40,44,48,49];opening=10;records=[]
  for i,(a,b)in enumerate(zip(received,closed)):
   end=opening+a-b;records.append(dict(period=f'P{i+1}',opening=opening,received=a,closed=b,ending=end,flag=end-opening>=4));opening=end
  summary=dict(periods=6,opening=10,received=268,closed=259,ending=19,flaggedPeriods=['P1','P4']);facts=[['FLOW TOTALS','268 received / 259 closed'],['BALANCE RECONCILIATION','10 + 268 − 259 = 19']]
 elif id=='interview-synthesis':
  extracts=[('I can find the current card when its version is visible.',['findability','version']),('I ask another reader when two cards look similar.',['findability','clarification']),('A short example helps me understand what to write.',['example','clarification']),('I keep the earlier version to compare the change.',['version']),('I want to know whom to ask about an unfamiliar term.',['clarification']),('An index lets me return to the card I used before.',['findability'])]
  records=[dict(extract_id=f'E{i+1}',text=t,tags=tags,invented=True)for i,(t,tags)in enumerate(extracts)];counts=dict(collections.Counter(tag for row in records for tag in row['tags']));summary=dict(extracts=6,tagAssignments=9,themeCounts=counts,actualInterviews=0);facts=[['INVENTED MATERIAL','6 extracts / 0 actual interviews'],['MULTI-LABEL CODING','9 assignments across 4 themes']]
 elif id=='landscape-scan':
  names=['North','Bridge','Grove','Beacon','Harbor','Thread'];flags=[[1,1,0,0],[1,0,1,1],[0,1,1,0],[1,1,0,1],[0,0,1,1],[1,1,1,0]];keys=['version','index','offline','review']
  records=[dict(option=n,**dict(zip(keys,map(bool,f))),invented=True)for n,f in zip(names,flags)];summary=dict(options=6,dimensions=4,cells=24,trueFlags=15,columnTotals=dict(zip(keys,[4,4,4,3])));facts=[['COMPARISON MODEL','6 invented options × 4 flags'],['FEATURE TOTALS','15 true flags / 24 cells; not market share']]
 else:
  records=[dict(version='V1',event='question',information='Version visibility and ownership are unclear.',choice=None),dict(version='V2',event='options',information='Retain folder; add labels; develop full index.',choice=None),dict(version='V3',event='choice',information='Narrow identification goal; maintenance unconfirmed.',choice='Explore visible version labels'),dict(version='V4',event='follow-up',information='Ownership remains unresolved.',choice=None),dict(version='V5',event='follow-up',information='Request a paper walkthrough; no outcome supplied.',choice=None)];summary=dict(events=5,choiceVersion='V3',preOrAtChoice=['V1','V2','V3'],laterVersions=['V4','V5'],actualOutcomes=0);facts=[['VERSIONED RECORD','5 invented events / choice at V3'],['LATER INFORMATION','V4 and V5 are follow-up, not decision-time inputs']]
 return dict(source='deterministic-invented-teaching-records',synthetic=True,summary=summary,records=records),facts
for s in specs:
 directory=r/'public/atelier'/s['id'];(directory/'images').mkdir(parents=True,exist_ok=True);source,facts=sources(s['id'])
 work={k:s[k]for k in ['id','title','subtitle','category','layout','color','wash','framework','scope']};work.update(format='文档',status='published',pages=10,illustrations=5,expectedIllustrations=5,expansion='documents-50',expansionBatch='report-expansion',newIllustrations=1,curatedIllustrations=4)
 pages=[dict(section=f'{i+1:02d} / {s["title"]}',title=p['title'],lead=p['lead'],body=p['body'],subheading='Analyst record / trace the source',detail='Separate the supplied synthetic result from your interpretation and any real-world evidence still needed.',question=p['question'],records=[dict(label=label,prompt='Record '+label.lower()+' and its source boundary.')for label in p['labels']],evidenceRows=facts,image=i//2+1,kind='cover' if i==0 else 'appendix' if i==9 else 'body')for i,p in enumerate(s['chapters'])]
 provenance=[dict(image=1,source='New AI-generated editorial illustration for '+s['id']),*[dict(image=n+2,source='Curated existing AI-generated illustration: '+src+'.jpg')for n,src in enumerate(s['sources'])]]
 for n in range(5):
  target=directory/'images'/f'{n+1:02d}.jpg'
  if n==0:
   src=pathlib.Path(os.environ.get('REPORT_HERO_DIR',str(r.parent/'.cache/report-expansion')))/(s['id']+'.jpg')
   if not src.exists():src=target
  else:
   case,num=s['sources'][n-1].split('/');src=r/'public/atelier'/case/'images'/(num+'.jpg')
  im=Image.open(src).convert('RGB');im.thumbnail((1050,760));im.save(target,quality=83,optimize=True)
 (directory/'data.json').write_text(json.dumps(dict(work=work,pages=pages,provenance=provenance),ensure_ascii=False,indent=2)+'\n');(directory/'content.js').write_text('export const work='+json.dumps(work,ensure_ascii=False)+';\nexport const imageCount=5;\nexport const pages='+json.dumps(pages,ensure_ascii=False)+';\n')
 (directory/'source.json').write_text(json.dumps(source,ensure_ascii=False,indent=2)+'\n');stream=io.StringIO();writer=csv.DictWriter(stream,fieldnames=list(source['records'][0]));writer.writeheader()
 for row in source['records']:writer.writerow({k:json.dumps(v,ensure_ascii=False)if isinstance(v,(list,dict))else v for k,v in row.items()})
 (directory/'source.csv').write_text(stream.getvalue())
(r/'public/atelier/report-expansion.json').write_text(json.dumps(dict(schemaVersion=1,cases=[s['id']for s in specs],pagesPerCase=10,distinctImagesPerCase=5,newImages=6,curatedExistingImages=24,completedOf50=18),indent=2)+'\n')
print('Prepared six reports, 60 pages, complete synthetic CSV/JSON and explicit image provenance.')
