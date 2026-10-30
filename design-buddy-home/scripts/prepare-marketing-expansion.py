"""Prepare complete authored English marketing documents and explicit illustrative registers."""
import pathlib,json,csv,io,sys,os
r=pathlib.Path(__file__).resolve().parents[1];sys.path.insert(0,str(r.parent/'.cache/expansion-python'))
from PIL import Image
specs=json.loads((r/'scripts/marketing-expansion-content.json').read_text())
def model(s):
 id=s['id']
 if id=='launch-kit':
  rows=[dict(channel=k,message=m,action='Review the concept outline',status='draft',actual_sends=None)for k,m in [('email','A saved note can lose its question. Explore the Fold Notes concept.'),('social','Keep the thought beside the note. Concept preview.'),('landing-page','Read the proposed capture, connect and revisit workflow.')]];summary=dict(plannedChannels=3,releasedPlacements=0,actualResults=None)
 elif id=='case-story':
  rows=[dict(element=k,source_type='authored-fiction',permission='not-obtained',verified_outcome=False)for k in ['setting','challenge','action','outcome','quotation']];summary=dict(sourceElements=5,actualInterviews=0,actualTestimonials=0,measuredChange=None,participantApproval=None)
 elif id=='comparison-guide':
  rows=[dict(option='sequence-folio',sequence=True,context_note=False,portable_set=True,review_trail=True),dict(option='context-card-box',sequence=False,context_note=True,portable_set=True,review_trail=False),dict(option='review-binder',sequence=True,context_note=True,portable_set=False,review_trail=True)];summary=dict(options=3,dimensions=4,trueFlags=8,assumedNotTested=True,prices=None,verifiedProducts=0)
 elif id=='editorial-calendar':
  topics=['Why save a question?','Annotate one passage','Revisit a changed note','Explain a handover','Write a context card','Question an instruction','Keep source context','Check an intended reader','Reflect on an exception','Explain a revision','Practice a source check','Review an open question'];rows=[dict(slot=f'S{i+1:02d}',pillar=['explain','practice','reflect'][i%3],channel=['article','email','social','handout'][i%4],topic=t,status='proposed',actual_date=None)for i,t in enumerate(topics)];summary=dict(proposedSlots=12,pillars=dict(explain=4,practice=4,reflect=4),channels=dict(article=3,email=3,social=3,handout=3),publishedSlots=0,actualAudience=None)
 elif id=='brand-voice':
  pairs=[('Transform your workflow instantly.','Review one step and identify what needs context.','unsupported outcome'),('Works for everyone.','Check whether the approach fits your task and access needs.','universal claim'),('Effortless.','Follow one documented step and review the result.','erased conditions'),('Guaranteed results.','State only the outcome supported by the available evidence.','unverified commitment'),('The best solution.','Describe the specific task and relevant limits.','unsupported ranking'),('Click here.','Review the concept outline.','unclear action'),('Hurry, do not miss out.','Review the actual conditions before deciding.','unsupported urgency'),('We fix everything.','Identify which part of the task needs clarification.','unbounded capability')];rows=[dict(rule_id=f'V{i+1:02d}',before=a,preferred=b,reason=c,status='editorial-choice',measured_lift=None)for i,(a,b,c)in enumerate(pairs)];summary=dict(rewritePairs=8,testedWinners=0,legalClearance=None,measuredEngagement=None)
 else:
  rows=[dict(order=i+1,touchpoint=k,journey_stage=stage,status='planned',actual_date=None,actual_contacts=None)for i,(k,stage)in enumerate([('poster','discover'),('social-post','discover'),('concept-outline','consider'),('email','consider'),('enquiry-reply','ask'),('follow-up','ask')])];summary=dict(touchpoints=6,stageCounts=dict(discover=2,consider=2,ask=2),deliveredTouchpoints=0,actualReach=None,actualConversions=None,sequenceNotCausation=True)
 return dict(source='authored-illustrative-marketing-register',synthetic=True,notActualCampaign=True,summary=summary,records=rows)
def facts(s,m,i):
 id=s['id'];row=m['records'][i%len(m['records'])]
 if id=='launch-kit':return [['CHANNEL REGISTER',row['channel']+' / draft'],['DELIVERY BOUNDARY','3 proposed placements; no sends or results supplied.']]
 if id=='case-story':return [['STORY SOURCE',row['element']+' / authored fiction'],['RIGHTS / OUTCOMES','No participant permission or measured change supplied.']]
 if id=='comparison-guide':return [['ASSUMED OPTION',row['option']],['COMPARISON MODEL','3 concepts × 4 flags / 8 yes cells / not verified products.']]
 if id=='editorial-calendar':return [['RELATIVE SLOT',row['slot']+' / '+row['pillar']+' / '+row['channel']],['PLANNING MODEL','12 proposed slots; no actual dates, publication or audience.']]
 if id=='brand-voice':return [['VOICE REGISTER',row['rule_id']+' / '+row['reason']],['EVIDENCE BOUNDARY','8 editorial rewrites; no tested winners or legal clearance.']]
 return [['TOUCHPOINT REGISTER',str(row['order'])+' / '+row['touchpoint']+' / '+row['journey_stage']],['JOURNEY BOUNDARY','6 planned touchpoints; sequence is not measured behaviour.']]
for s in specs:
 d=r/'public/atelier'/s['id'];(d/'images').mkdir(parents=True,exist_ok=True);work={k:s[k]for k in ['id','title','subtitle','category','layout','color','wash','framework','scope']};work.update(format='文档',status='published',pages=10,illustrations=5,expectedIllustrations=5,expansion='documents-50',expansionBatch='marketing-expansion',newIllustrations=1,curatedIllustrations=4)
 m=model(s);pages=[dict(section=f'{i+1:02d} / {s["title"]}',**c,image=i//2+1,kind='cover' if i==0 else 'appendix' if i==9 else 'body',evidenceRows=facts(s,m,i))for i,c in enumerate(s['chapters'])];provenance=[dict(image=1,source='New AI-generated editorial illustration for '+s['id']),*[dict(image=n+2,source='Curated existing AI-generated illustration: '+src+'.jpg')for n,src in enumerate(s['sources'])]]
 for n in range(5):
  target=d/'images'/f'{n+1:02d}.jpg'
  if '--keep-images' in sys.argv and target.exists():continue
  if n==0:
   src=pathlib.Path(os.environ.get('MARKETING_HERO_DIR',str(r.parent/'.cache/marketing-expansion')))/(s['id']+'.jpg')
   if not src.exists():src=target
  else:
   case,num=s['sources'][n-1].split('/');src=r/'public/atelier'/case/'images'/(num+'.jpg')
  im=Image.open(src).convert('RGB');im.thumbnail((1000,740));im.save(target,quality=83,optimize=True)
 (d/'data.json').write_text(json.dumps(dict(work=work,pages=pages,provenance=provenance),ensure_ascii=False,indent=2)+'\n');(d/'content.js').write_text('export const work='+json.dumps(work,ensure_ascii=False)+';\nexport const imageCount=5;\nexport const pages='+json.dumps(pages,ensure_ascii=False)+';\n');(d/'source.json').write_text(json.dumps(m,ensure_ascii=False,indent=2)+'\n');stream=io.StringIO();writer=csv.DictWriter(stream,fieldnames=list(m['records'][0]),lineterminator='\n');writer.writeheader();writer.writerows(m['records']);(d/'source.csv').write_text(stream.getvalue())
(r/'public/atelier/marketing-expansion.json').write_text(json.dumps(dict(schemaVersion=1,cases=[s['id']for s in specs],pagesPerCase=10,distinctImagesPerCase=5,newImages=6,curatedExistingImages=24,completedOf50=29),indent=2)+'\n');print('Prepared six complete English marketing sources, 60 pages, 30 illustrations and six source registers.')
