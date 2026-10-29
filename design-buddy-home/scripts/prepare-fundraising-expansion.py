"""Prepare five authored speech documents, traceable illustrative sources and image derivatives."""
import pathlib,json,csv,io,sys,os
r=pathlib.Path(__file__).resolve().parents[1];sys.path.insert(0,str(r.parent/'.cache/expansion-python'))
from PIL import Image
specs=json.loads((r/'scripts/fundraising-expansion-content.json').read_text())
def source(s):
 id=s['id']
 if id=='founder-narrative':
  rows=[dict(category='discovery',teaching_units=45,real_currency=False),dict(category='prototype-question',teaching_units=35,real_currency=False),dict(category='review',teaching_units=20,real_currency=False)];summary=dict(totalTeachingUnits=100,notCurrency=True,actualAsk=None)
 elif id=='traction-dialogue':
  visits=[1]*16+[2]*10+[3]*4;rows=[dict(workspace_id=f'W{i+1:02d}',session_events=n,paid_status=None,invented=True)for i,n in enumerate(visits)];summary=dict(workspaces=30,sessionEvents=48,repeatedWorkspaces=14,singleSession=16,twoSessions=10,threeSessions=4,observationWindow=None,retentionNotEstablished=True,revenueNotSupplied=True)
 elif id=='technical-thesis':
  rows=[dict(stage='capture',design_intention='Keep a reference with its source context.',evidence_status='not-tested'),dict(stage='link',design_intention='Associate the reference with an intended passage.',evidence_status='not-tested'),dict(stage='review',design_intention='Expose unresolved context to a human reviewer.',evidence_status='not-tested')];summary=dict(conceptualStages=3,validatedStages=0,benchmark=None,deployedSystem=False)
 elif id=='impact-thesis':
  rows=[dict(path='impact',hypothesis=h,evidence_status='unverified')for h in ['resource-availability','contextual-adaptation','appropriate-use']]+[dict(path='commercial',hypothesis=h,evidence_status='unverified')for h in ['defined-offering','adopting-organisation','sustainable-payment']];summary=dict(impactHypotheses=3,commercialHypotheses=3,validatedHypotheses=0,measuredImpact=None,revenue=None)
 else:
  rows=[dict(module_id=f'Q{i+1:02d}',page=i+1,question=c['title'],evidence_status='illustrative-only')for i,c in enumerate(s['chapters'])];summary=dict(modules=10,realMeeting=False,actualAsk=None,agreedTerms=None)
 return dict(source='authored-fictional-pitch-model',synthetic=True,notInvestmentOffer=True,summary=summary,records=rows)
for s in specs:
 d=r/'public/atelier'/s['id'];(d/'images').mkdir(parents=True,exist_ok=True);work={k:s[k]for k in ['id','title','subtitle','category','layout','color','wash','framework','scope']};work.update(format='文档',status='published',pages=10,illustrations=5,expectedIllustrations=5,expansion='documents-50',expansionBatch='fundraising-expansion',newIllustrations=1,curatedIllustrations=4)
 pages=[dict(section=f'{i+1:02d} / {s["title"]}',title=c['title'],lead=c['lead'],body=c['body'],subheading='Speaker / evidence note — not a performance claim',detail='Keep the fictional status visible. Replace illustrative material only with appropriately sourced, verified information; proposed questions are not completed diligence.',question=c['question'],records=[dict(label=label,prompt=value)for label,value in zip(c['labels'],c['recordValues'])],image=i//2+1,kind='cover' if i==0 else 'appendix' if i==9 else 'body')for i,c in enumerate(s['chapters'])]
 provenance=[dict(image=1,source='New AI-generated editorial illustration for '+s['id']),*[dict(image=n+2,source='Curated existing AI-generated illustration: '+src+'.jpg')for n,src in enumerate(s['sources'])]]
 for n in range(5):
  target=d/'images'/f'{n+1:02d}.jpg'
  if '--keep-images' in sys.argv and target.exists():continue
  if n==0:
   src=pathlib.Path(os.environ.get('FUNDRAISING_HERO_DIR',str(r.parent/'.cache/fundraising-expansion')))/(s['id']+'.jpg')
   if not src.exists():src=target
  else:
   case,num=s['sources'][n-1].split('/');src=r/'public/atelier'/case/'images'/(num+'.jpg')
  im=Image.open(src).convert('RGB');im.thumbnail((1000,740));im.save(target,quality=83,optimize=True)
 (d/'data.json').write_text(json.dumps(dict(work=work,pages=pages,provenance=provenance),ensure_ascii=False,indent=2)+'\n');(d/'content.js').write_text('export const work='+json.dumps(work,ensure_ascii=False)+';\nexport const imageCount=5;\nexport const pages='+json.dumps(pages,ensure_ascii=False)+';\n');model=source(s);(d/'source.json').write_text(json.dumps(model,ensure_ascii=False,indent=2)+'\n');stream=io.StringIO();writer=csv.DictWriter(stream,fieldnames=list(model['records'][0]),lineterminator='\n');writer.writeheader();writer.writerows(model['records']);(d/'source.csv').write_text(stream.getvalue())
(r/'public/atelier/fundraising-expansion.json').write_text(json.dumps(dict(schemaVersion=1,cases=[s['id']for s in specs],pagesPerCase=10,distinctImagesPerCase=5,newImages=5,curatedExistingImages=20,completedOf50=23),indent=2)+'\n');print('Prepared five complete speech sources, 50 pages, explicit model registers and 25 sourced images.')
