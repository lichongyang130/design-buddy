"""Prepare authored training pages and traceable curated image derivatives; no new art is claimed."""
import pathlib,json,csv,io,sys
r=pathlib.Path(__file__).resolve().parents[1];sys.path.insert(0,str(r.parent/'.cache/expansion-python'))
from PIL import Image
specs=json.loads((r/'scripts/training-expansion-content.json').read_text())
def model(s):
 id=s['id']
 if id=='role-onboarding':
  rows=[dict(gate=f'G{i+1:02d}',focus=f,artifact=a,status='not-assessed',actual_observation=None)for i,(f,a)in enumerate([('role-boundary','role explanation'),('task-language','annotated sample'),('handoff','review note'),('feedback-revision','revised question'),('help-route','bounded request')])];summary=dict(proposedGates=5,assessedGates=0,employmentRequirement=None,certification=None)
 elif id=='scenario-practice':
  rows=[dict(branch=b,choice=c,discussion_page=n,return_page=5,evidence_status='conceptual-not-predicted')for b,c,n in [('A','seek clarification',6),('B','proceed on an assumption',7),('C','pause and name the condition',8)]];summary=dict(routes=3,decisionPage=5,actualIncidents=0,scoredAnswers=None)
 elif id=='facilitator-guide':
  rows=[dict(block=b,teaching_minutes=n,status='proposed',actual_duration=None)for b,n in [('opening',5),('demonstration',8),('practice',12),('discussion',12),('closing',8)]];summary=dict(proposedBlocks=5,totalTeachingMinutes=45,actualAttendance=None,measuredLearningGain=None)
 elif id=='peer-coaching':
  rows=[dict(stage=k,purpose=v,status='planned',actual_participant=None,actual_agreement=None)for k,v in [('agreement','define a bounded task and record use'),('clarify','understand the speaker’s task'),('listen','check a tentative reflection'),('explore','compare options without prescription'),('action','choose an inspectable next attempt'),('review','revisit scope and ending')]];summary=dict(plannedStages=6,completedConversations=0,actualActionCommitment=None,confidentialityGuarantee=False,professionalAccreditation=None)
 elif id=='process-rehearsal':
  rows=[dict(step=i+1,lane=lane,activity=a,input_artifact=inp,output_artifact=op,status='not-rehearsed')for i,(lane,a,inp,op)in enumerate([('writer','prepare','invented passage','draft with question'),('coordinator','check','draft with question','source-gap note'),('reviewer','inspect','source-gap note','review question'),('writer','return','review question','clarification needed')])];summary=dict(proposedSteps=4,roles=3,completedRehearsals=0,actualImprovement=None,operatingAuthority=None)
 else:
  dims=['clarity','source-context','qualification','revision-rationale'];rows=[dict(attempt=f'A{i+1:02d}',dimension=k,status='not-assessed',actual_artifact=None,score=None)for i in range(3)for k in dims];summary=dict(proposedAttempts=3,dimensions=4,evidenceCells=12,assessedCells=0,actualGrowth=None,certification=None)
 return dict(source='authored-fictional-training-register',synthetic=True,notCertification=True,summary=summary,records=rows)
def facts(s,m,i):
 id=s['id'];row=m['records'][i%len(m['records'])]
 if id=='role-onboarding':return [['LEARNING GATE',row['gate']+' / '+row['focus']],['EVIDENCE STATUS','5 proposed gates; none assessed. No readiness decision.']]
 if id=='scenario-practice':return [['DISCUSSION ROUTE',row['branch']+' / '+row['choice']],['REHEARSAL BOUNDARY','3 conceptual choices; no predicted outcome or score.']]
 if id=='facilitator-guide':return [['PROPOSED BLOCK',row['block']+' / '+str(row['teaching_minutes'])+' teaching minutes'],['TIMEBOX MODEL','5 + 8 + 12 + 12 + 8 = 45 planned minutes; not actual time.']]
 if id=='peer-coaching':return [['CONVERSATION STAGE',row['stage']+' / planned'],['AGREEMENT BOUNDARY','6 stages; no actual commitment or confidentiality guarantee.']]
 if id=='process-rehearsal':return [['MODEL STEP',str(row['step'])+' / '+row['lane']+' / '+row['activity']],['WORKFLOW BOUNDARY','4 proposed steps, 3 roles; not an authorised procedure.']]
 return [['EVIDENCE CELL',row['attempt']+' / '+row['dimension']+' / not assessed'],['PORTFOLIO MODEL','3 attempts × 4 dimensions = 12 unassessed cells, not zero scores.']]
for s in specs:
 d=r/'public/atelier'/s['id'];(d/'images').mkdir(parents=True,exist_ok=True);work={k:s[k]for k in ['id','title','subtitle','category','layout','color','wash','framework','scope']};work.update(format='文档',status='published',pages=10,illustrations=5,expectedIllustrations=5,expansion='documents-50',expansionBatch='training-expansion',newIllustrations=0,curatedIllustrations=5)
 m=model(s);pages=[dict(section=f'{i+1:02d} / {s["title"]}',**c,image=i//2+1,kind='cover' if i==0 else 'appendix' if i==9 else 'body',evidenceRows=facts(s,m,i))for i,c in enumerate(s['chapters'])]
 if s['id']=='scenario-practice':
  pages[4]['navigation']=[dict(page=6,label='A / Clarify'),dict(page=7,label='B / Trace the assumption'),dict(page=8,label='C / Pause and review')]
  for i in [5,6,7]:pages[i]['navigation']=[dict(page=5,label='Return to the decision')]
 provenance=[dict(image=n+1,source='Curated existing AI-generated illustration: '+src+'.jpg')for n,src in enumerate(s['sources'])]
 for n,src in enumerate(s['sources']):
  target=d/'images'/f'{n+1:02d}.jpg'
  if '--keep-images' in sys.argv and target.exists():continue
  case,num=src.split('/');im=Image.open(r/'public/atelier'/case/'images'/(num+'.jpg')).convert('RGB');im.thumbnail((1000,740));im.save(target,quality=83,optimize=True)
 (d/'data.json').write_text(json.dumps(dict(work=work,pages=pages,provenance=provenance),ensure_ascii=False,indent=2)+'\n');(d/'content.js').write_text('export const work='+json.dumps(work,ensure_ascii=False)+';\nexport const imageCount=5;\nexport const pages='+json.dumps(pages,ensure_ascii=False)+';\n');(d/'source.json').write_text(json.dumps(m,ensure_ascii=False,indent=2)+'\n');stream=io.StringIO();writer=csv.DictWriter(stream,fieldnames=list(m['records'][0]),lineterminator='\n');writer.writeheader();writer.writerows(m['records']);(d/'source.csv').write_text(stream.getvalue())
(r/'public/atelier/training-expansion.json').write_text(json.dumps(dict(schemaVersion=1,cases=[s['id']for s in specs],pagesPerCase=10,distinctImagesPerCase=5,newImages=0,curatedExistingImages=30,completedOf50=35),indent=2)+'\n');print('Prepared six English training documents / 60 pages / 30 curated image placements with explicit provenance.')
