"""Prepare complete fictional event guides and attributable curated illustration derivatives."""
import pathlib,json,csv,io,sys
r=pathlib.Path(__file__).resolve().parents[1];sys.path.insert(0,str(r.parent/'.cache/expansion-python'))
from PIL import Image
specs=json.loads((r/'scripts/event-expansion-content.json').read_text())
passages={
 'P01':('The Place at the Table','The light moved across the table. Mira left a cup beside a folded letter. When she returned, the room looked unchanged, but the place she intended to sit no longer felt like hers.'),
 'P02':('The Sign at the Fork','At the fork, the sign named two places but pointed to neither. I stayed beside it until the footsteps behind me faded. Then the silence seemed less like an answer than another direction.'),
 'P03':('The Box of Relations','The box held a key, a ribbon and a label from an empty drawer. I kept them together, not because they were valuable, but because each changed what the others seemed to mean.')}
def model(s):
 id=s['id']
 if id=='community-forum':
  rows=[dict(note_id=f'N{i+1:02d}',topic_id=t,kind=k,note=v,source_type='authored-prompt',actual_contributor=None)for i,(t,k,v)in enumerate([('T01','proposal','Keep a short orientation note beside a catalogue.'),('T01','question','Who determines what a new reader needs to understand?'),('T02','proposal','Keep a shared resource catalogue with source context.'),('T02','question','Who checks whether the explanation remains current?'),('T03','proposal','Offer a clearly described voluntary contribution route.'),('T03','question','Who could agree and carry the relevant responsibility?')])];summary=dict(topicCircles=3,authoredNoteExamples=6,actualParticipants=None,actualVotes=None,actualConsensus=None,consensusNotEstablished=True)
 elif id=='exhibition-guide':
  titles=['Window Note','Unnamed Shelf','Label Exchange','Paired Traces','Return Card','Changed Margin'];rows=[dict(work_id=f'W{i+1:02d}',title=t,zone_id=f'Z{i//2+1:02d}',guide_page=4+i//2,source_type='authored-work-card',actual_object=None,display_permission=None)for i,t in enumerate(titles)];summary=dict(zones=3,workCards=6,indexPage=3,actualVenue=None,actualInstalledWorks=None,actualVisitorResponses=None)
 elif id=='workshop-runbook':
  rows=[dict(block=k,planned_minutes=n,station=station,input_artifact=inp,output_artifact=out,status='planned',actual_duration=None)for k,n,station,inp,out in [('opening',5,None,'invented passage','shared task'),('station-one',12,'S01','shared task','tentative connection'),('transfer',3,None,'tentative connection','tentative connection'),('station-two',15,'S02','tentative connection','draft context card'),('sharing',15,None,'draft context card','review question'),('closing',10,None,'review question','question retained')]];summary=dict(blocks=6,taskStations=2,plannedMinutes=60,actualAttendance=None,actualDuration=None,measuredLearningGain=None)
 elif id=='reading-salon':
  rows=[dict(passage_id=id,title=t,passage=text,round=round,status='unrecorded',actual_response=None,recording_permission=None)for id,(t,text)in passages.items()for round in ['first-response','closer-reading','comparison']];summary=dict(passages=3,rounds=3,discussionCells=9,originalExerciseTexts=True,externalPublication=None,actualReaderResponses=None,actualAttendance=None)
 else:
  rows=[dict(unit_id=id,unit_title=t,feedback_field=f,status='uncollected',actual_feedback=None,contact_opt_in=None)for id,t in [('D01','Context Card'),('D02','Folded Route'),('D03','Revision Window')]for f in ['clarity','open-question','next-artifact']];summary=dict(authoredUnits=3,feedbackFields=3,feedbackCells=9,actualPresentations=None,actualAudience=None,actualEndorsements=None,actualContacts=None)
 return dict(source='authored-fictional-event-register',synthetic=True,notActualEvent=True,summary=summary,records=rows)
def facts(s,m,i):
 id=s['id'];row=m['records'][i%len(m['records'])]
 if id=='community-forum':return [['FORUM NOTE',row['note_id']+' / '+row['topic_id']+' / '+row['kind']],['SOURCE BOUNDARY','3 circles, 6 authored examples; no actual views, votes or consensus.']]
 if id=='exhibition-guide':return [['WORK-CARD INDEX',row['work_id']+' / '+row['title']+' / '+row['zone_id']],['VENUE BOUNDARY','3 conceptual zones, 6 fictional work cards; no installed works.']]
 if id=='workshop-runbook':return [['PLANNED BLOCK',row['block']+' / '+str(row['planned_minutes'])+' minutes'],['RUN-SHEET MODEL','5 + 12 + 3 + 15 + 15 + 10 = 60 planned minutes, not elapsed time.']]
 if id=='reading-salon':return [['READING CELL',row['passage_id']+' / '+row['round']],['TEXT / RESPONSE BOUNDARY','3 original passages × 3 rounds; 9 unrecorded cells, not reader responses.']]
 return [['DEMO FEEDBACK CELL',row['unit_id']+' / '+row['feedback_field']],['SHOWCASE BOUNDARY','3 authored units × 3 fields; no real demo, feedback or endorsement.']]
for s in specs:
 d=r/'public/atelier'/s['id'];(d/'images').mkdir(parents=True,exist_ok=True);work={k:s[k]for k in ['id','title','subtitle','category','layout','color','wash','framework','scope']};work.update(format='文档',status='published',pages=10,illustrations=5,expectedIllustrations=5,expansion='documents-50',expansionBatch='event-expansion',newIllustrations=0,curatedIllustrations=5)
 m=model(s);pages=[dict(section=f'{i+1:02d} / {s["title"]}',**c,image=i//2+1,kind='cover' if i==0 else 'appendix' if i==9 else 'body',evidenceRows=facts(s,m,i))for i,c in enumerate(s['chapters'])]
 if s['id']=='exhibition-guide':
  pages[2]['navigation']=[dict(page=4,label='Z01 / Notice'),dict(page=5,label='Z02 / Connect'),dict(page=6,label='Z03 / Revisit')]
  for i in [3,4,5]:pages[i]['navigation']=[dict(page=3,label='Return to the zone index')]
 provenance=[dict(image=n+1,source='Curated existing AI-generated illustration: '+src+'.jpg')for n,src in enumerate(s['sources'])]
 for n,src in enumerate(s['sources']):
  target=d/'images'/f'{n+1:02d}.jpg'
  if '--keep-images' in sys.argv and target.exists():continue
  case,num=src.split('/');im=Image.open(r/'public/atelier'/case/'images'/(num+'.jpg')).convert('RGB');im.thumbnail((1000,740));im.save(target,quality=83,optimize=True)
 (d/'data.json').write_text(json.dumps(dict(work=work,pages=pages,provenance=provenance),ensure_ascii=False,indent=2)+'\n');(d/'content.js').write_text('export const work='+json.dumps(work,ensure_ascii=False)+';\nexport const imageCount=5;\nexport const pages='+json.dumps(pages,ensure_ascii=False)+';\n');(d/'source.json').write_text(json.dumps(m,ensure_ascii=False,indent=2)+'\n');stream=io.StringIO();writer=csv.DictWriter(stream,fieldnames=list(m['records'][0]),lineterminator='\n');writer.writeheader();writer.writerows(m['records']);(d/'source.csv').write_text(stream.getvalue())
(r/'public/atelier/event-expansion.json').write_text(json.dumps(dict(schemaVersion=1,cases=[s['id']for s in specs],pagesPerCase=10,distinctImagesPerCase=5,newImages=0,curatedExistingImages=25,completedOf50=45),indent=2)+'\n');print('Prepared five complete English event guides / 50 pages / 25 curated illustrations / explicit fictional registers.')
