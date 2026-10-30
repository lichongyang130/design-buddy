"""Prepare five authored business-planning documents and inspectable fictional models."""
import pathlib,json,csv,io,sys,math
r=pathlib.Path(__file__).resolve().parents[1];sys.path.insert(0,str(r.parent/'.cache/expansion-python'))
from PIL import Image
specs=json.loads((r/'scripts/business-expansion-content.json').read_text())
def model(s):
 id=s['id']
 if id=='lean-venture':
  rows=[dict(hypothesis=f'H{i+1:02d}',domain=k,question=q,status='untested',actual_evidence=None)for i,(k,q)in enumerate([('customer','Who uses, chooses and authorises the offering?'),('problem','Does the task warrant a separate offering?'),('value','Does the mechanism make a useful difference to the task?'),('channel','Can an appropriate reader understand the concept?'),('revenue','Who would pay for which defined engagement?'),('cost','What work and resources would delivery require?')])];summary=dict(hypotheses=6,validatedHypotheses=0,actualCustomers=None,actualRevenue=None,actualFunding=None)
 elif id=='scenario-ledger':
  rows=[]
  for kind,case,demand,capacity in [('scenario','conservative',8,12),('scenario','baseline',12,12),('scenario','exploratory',16,12),('sensitivity','capacity-10',12,10),('sensitivity','capacity-12',12,12),('sensitivity','capacity-14',12,14)]:
   delivered=min(demand,capacity);rows.append(dict(kind=kind,case=case,demand=demand,capacity=capacity,delivered=delivered,unmet=max(demand-delivered,0),unused=max(capacity-delivered,0),benefit_points=4*delivered,resource_points=12+2*delivered,net_points=4*delivered-(12+2*delivered)))
  summary=dict(scenarioRows=3,sensitivityRows=3,pointsNotCurrency=True,window=None,actualForecast=None,actualProfit=None)
 elif id=='service-economics':
  rows=[]
  for name,demand in [('lower',6),('reference',8),('higher',10)]:
   available=450;reserve=90;minutes=45;capacity=(available-reserve)//minutes;delivered=min(demand,capacity);rows.append(dict(case=name,demand=demand,available_minutes=available,reserve_minutes=reserve,session_minutes=minutes,capacity=capacity,delivered=delivered,unmet=max(demand-delivered,0),unused_service_minutes=available-reserve-delivered*minutes,benefit_credits=10*delivered,variable_credits=4*delivered,fixed_credits=20,net_credits=6*delivered-20))
  summary=dict(cases=3,capacity=8,unitContributionCredits=6,fixedCredits=20,teachingThresholdSessions=math.ceil(20/6),creditsNotCurrency=True,actualDemand=None,actualProfit=None)
 elif id=='growth-options':
  rows=[dict(option=f'O{i+1:02d}',name=name,teaching_tokens=n,depends_on=deps,status='not-explored',actual_result=None)for i,(name,n,deps)in enumerate([('core-task',2,[]),('companion-worksheet',3,['O01']),('team-use-format',5,['O01','O02']),('editorial-channel',4,['O01']),('partner-introduction',6,['O04'])])];summary=dict(options=5,totalRequestedTokens=20,illustrativeAllowance=8,tokensNotCurrency=True,actualGrowth=None,actualReturn=None,approvedBudget=None)
 else:
  rows=[dict(interface=i+1,capability=c,from_role=a,to_role=b,input_artifact=inp,output_artifact=op,status='proposed',delegated_authority=False,actual_assignment=None)for i,(c,a,b,inp,op)in enumerate([('intake','owner','author','scoped brief','draft'),('explanation','author','coordinator','draft','source-status note'),('source-coordination','coordinator','reviewer','source-status note','review question'),('review','reviewer','author','review question','revision rationale'),('revision','author','owner','revision rationale','revised explanation')])];summary=dict(interfaces=5,roles=4,implementedInterfaces=0,actualAppointments=None,actualPerformance=None,operatingAuthority=None)
 return dict(source='authored-fictional-business-model',synthetic=True,notActualForecast=True,summary=summary,records=rows)
def facts(s,m,i):
 id=s['id'];row=m['records'][i%len(m['records'])]
 if id=='lean-venture':return [['CANVAS REGISTER',row['hypothesis']+' / '+row['domain']+' / untested'],['EVIDENCE BOUNDARY','6 hypotheses; no validated demand, customers or revenue.']]
 if id=='scenario-ledger':return [['DRIVER ROW',row['case']+' / demand '+str(row['demand'])+' / capacity '+str(row['capacity'])],['TEACHING MODEL','Delivered '+str(row['delivered'])+' / net '+str(row['net_points'])+' points, not money or a forecast.']]
 if id=='service-economics':return [['CAPACITY MODEL','(450 − 90) ÷ 45 = 8 whole sessions'],['UNIT MODEL','10 − 4 = 6 credits / ceil(20 ÷ 6) = 4; not financial break-even.']]
 if id=='growth-options':return [['OPTION REGISTER',row['option']+' / '+row['name']+' / '+str(row['teaching_tokens'])+' tokens'],['RESOURCE BOUNDARY','20 requested / 8 illustrative allowance; no approved budget or return.']]
 return [['PROPOSED INTERFACE',str(row['interface'])+' / '+row['from_role']+' → '+row['to_role']],['AUTHORITY BOUNDARY','5 interfaces, 4 roles; no appointments or delegated authority.']]
for s in specs:
 d=r/'public/atelier'/s['id'];(d/'images').mkdir(parents=True,exist_ok=True);work={k:s[k]for k in ['id','title','subtitle','category','layout','color','wash','framework','scope']};work.update(format='文档',status='published',pages=10,illustrations=5,expectedIllustrations=5,expansion='documents-50',expansionBatch='business-expansion',newIllustrations=0,curatedIllustrations=5)
 m=model(s);pages=[dict(section=f'{i+1:02d} / {s["title"]}',**c,image=i//2+1,kind='cover' if i==0 else 'appendix' if i==9 else 'body',evidenceRows=facts(s,m,i))for i,c in enumerate(s['chapters'])];provenance=[dict(image=n+1,source='Curated existing AI-generated illustration: '+src+'.jpg')for n,src in enumerate(s['sources'])]
 for n,src in enumerate(s['sources']):
  target=d/'images'/f'{n+1:02d}.jpg'
  if '--keep-images' in sys.argv and target.exists():continue
  case,num=src.split('/');im=Image.open(r/'public/atelier'/case/'images'/(num+'.jpg')).convert('RGB');im.thumbnail((1000,740));im.save(target,quality=83,optimize=True)
 (d/'data.json').write_text(json.dumps(dict(work=work,pages=pages,provenance=provenance),ensure_ascii=False,indent=2)+'\n');(d/'content.js').write_text('export const work='+json.dumps(work,ensure_ascii=False)+';\nexport const imageCount=5;\nexport const pages='+json.dumps(pages,ensure_ascii=False)+';\n');(d/'source.json').write_text(json.dumps(m,ensure_ascii=False,indent=2)+'\n');stream=io.StringIO();writer=csv.DictWriter(stream,fieldnames=list(m['records'][0]),lineterminator='\n');writer.writeheader();writer.writerows([{k:json.dumps(v)if isinstance(v,(list,dict))else v for k,v in row.items()}for row in m['records']]);(d/'source.csv').write_text(stream.getvalue())
(r/'public/atelier/business-expansion.json').write_text(json.dumps(dict(schemaVersion=1,cases=[s['id']for s in specs],pagesPerCase=10,distinctImagesPerCase=5,newImages=0,curatedExistingImages=25,completedOf50=40),indent=2)+'\n');print('Prepared five English business documents / 50 pages / 25 curated illustrations / explicit fictional sources.')
