"""Prepare complete fictional product-design documents and attributable curated illustration derivatives."""
import pathlib,json,csv,io,sys
r=pathlib.Path(__file__).resolve().parents[1];sys.path.insert(0,str(r.parent/'.cache/expansion-python'))
from PIL import Image
specs=json.loads((r/'scripts/product-expansion-content.json').read_text())
def model(s):
 id=s['id']
 if id=='discovery-map':
  rows=[dict(node=n,parent=p,kind=k,statement=t,status=status,actual_evidence=None)for n,p,k,t,status in [('O00',None,'outcome','Make the passage-note relationship inspectable','intended'),('O01','O00','opportunity','Recover relevant source context','unvalidated'),('O02','O00','opportunity','Understand revision status','unvalidated'),('H11','O01','hypothesis','An adjacent excerpt may support context recovery','untested'),('H12','O01','hypothesis','A source link may support context recovery','untested'),('H21','O02','hypothesis','A visible status label may explain revision state','untested'),('H22','O02','hypothesis','A change note may explain revision meaning','untested')]];summary=dict(nodes=7,opportunities=2,hypotheses=4,root='O00',actualUsers=None,validatedNeeds=None,actualFindings=None)
 elif id=='interaction-contract':
  rows=[dict(from_state=a,event=e,to_state=b,source_type='authored-contract',implemented=False)for a,e,b in [('draft','review','review'),('review','edit','draft'),('review','save-ok','saved'),('review','save-fail','error'),('error','retry','review'),('saved','edit','draft')]];summary=dict(states=['draft','review','saved','error'],initialState='draft',transitions=6,undefinedPair='reject-without-mutation',livePersistence=None,usabilityResults=None,accessibilityConformance=None)
 elif id=='design-critique':
  rows=[dict(alternative=a,principle=p,criterion=c,score=None,status='unassessed',actual_rationale=None)for a in ['A','B']for p,c in [('P01','context traceability'),('P02','recovery clarity'),('P03','reading economy')]];summary=dict(alternatives=2,principles=3,scoreCells=6,rubric={'0':'not represented','1':'partly represented','2':'coherently represented'},ordinalNotInterval=True,actualReviewers=None,actualScores=None,approval=None)
 elif id=='component-system':
  rows=[dict(variant=v,context_visible=visible,action_enabled=enabled,action_label=label,reason_required=reason,implemented=False)for v,visible,enabled,label,reason in [('default',False,True,'Show context',False),('expanded',True,True,'Hide context',False),('unavailable',False,False,None,True)]];summary=dict(slots=['heading','source','body','action','status'],requiredContent=['heading','source','body'],variants=3,version='0.1',exclusiveVariants=True,shippedPackage=None,verifiedConsumers=None,accessibilityConformance=None)
 else:
  rows=[dict(task_id=id,goal=g,checkpoint=c,status='unrecorded',observation=None,actual_session=None)for id,g in [('T01','Explain which passage the note concerns'),('T02','Describe how to reveal more context'),('T03','Explain the next step when context is unavailable')]for c in ['first-interpretation','attempted-action','unresolved-question']];summary=dict(tasks=3,checkpoints=3,observationCells=9,actualParticipants=None,actualSessions=None,completionRate=None,taskTime=None,actualFindings=None)
 return dict(source='authored-fictional-product-specification',synthetic=True,notActualProductEvidence=True,summary=summary,records=rows)
def facts(s,m,i):
 id=s['id'];row=m['records'][i%len(m['records'])]
 if id=='discovery-map':return [['TREE NODE',row['node']+' / '+row['kind']+' / '+row['status']],['EVIDENCE BOUNDARY','7 authored nodes: 1 outcome, 2 opportunities, 4 untested hypotheses.']]
 if id=='interaction-contract':return [['CONTRACT ROW',row['from_state']+' + '+row['event']+' → '+row['to_state']],['MODEL BOUNDARY','4 states, 6 unique transitions; undefined pairs are rejected. Not implemented.']]
 if id=='design-critique':return [['REVIEW CELL',row['alternative']+' / '+row['principle']+' / '+row['criterion']],['RUBRIC BOUNDARY','0 not represented; 1 partly represented; 2 coherent. All 6 scores null.']]
 if id=='component-system':return [['VARIANT ROW',row['variant']+' / '+(row['action_label'] or 'no action')],['COMPONENT BOUNDARY','5 slots, 3 exclusive variants. Authored requirements, not a shipped library.']]
 return [['OBSERVATION CELL',row['task_id']+' / '+row['checkpoint']],['STUDY BOUNDARY','3 tasks × 3 checkpoints; 9 unrecorded cells. No participant data.']]
for s in specs:
 d=r/'public/atelier'/s['id'];(d/'images').mkdir(parents=True,exist_ok=True);work={k:s[k]for k in ['id','title','subtitle','category','layout','color','wash','framework','scope']};work.update(format='文档',status='published',pages=10,illustrations=5,expectedIllustrations=5,expansion='documents-50',expansionBatch='product-expansion',newIllustrations=0,curatedIllustrations=5)
 m=model(s);pages=[dict(section=f'{i+1:02d} / {s["title"]}',**c,image=i//2+1,kind='cover' if i==0 else 'appendix' if i==9 else 'body',evidenceRows=facts(s,m,i))for i,c in enumerate(s['chapters'])]
 provenance=[dict(image=n+1,source='Curated existing AI-generated illustration: '+src+'.jpg')for n,src in enumerate(s['sources'])]
 for n,src in enumerate(s['sources']):
  target=d/'images'/f'{n+1:02d}.jpg'
  if '--keep-images' in sys.argv and target.exists():continue
  case,num=src.split('/');im=Image.open(r/'public/atelier'/case/'images'/(num+'.jpg')).convert('RGB');im.thumbnail((1000,740));im.save(target,quality=83,optimize=True)
 (d/'data.json').write_text(json.dumps(dict(work=work,pages=pages,provenance=provenance),ensure_ascii=False,indent=2)+'\n');(d/'content.js').write_text('export const work='+json.dumps(work,ensure_ascii=False)+';\nexport const imageCount=5;\nexport const pages='+json.dumps(pages,ensure_ascii=False)+';\n');(d/'source.json').write_text(json.dumps(m,ensure_ascii=False,indent=2)+'\n');stream=io.StringIO();writer=csv.DictWriter(stream,fieldnames=list(m['records'][0]),lineterminator='\n');writer.writeheader();writer.writerows(m['records']);(d/'source.csv').write_text(stream.getvalue())
(r/'public/atelier/product-expansion.json').write_text(json.dumps(dict(schemaVersion=1,cases=[s['id']for s in specs],pagesPerCase=10,distinctImagesPerCase=5,newImages=0,curatedExistingImages=25,completedOf50=50),indent=2)+'\n');print('Prepared five complete English product-design documents / 50 pages / 25 curated illustrations / explicit fictional registers.')
