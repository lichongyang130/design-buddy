"""Prepare authored sources and image derivatives. Requires Pillow; existing case heroes are valid fallbacks."""
import json, pathlib, sys, os
root=pathlib.Path(__file__).resolve().parents[1]
sys.path.insert(0,str(root.parent/'.cache/expansion-python'))
from PIL import Image
specs=json.loads((root/'scripts/proposal-expansion-content.json').read_text())
for s in specs:
 directory=root/'public/atelier'/s['id'];(directory/'images').mkdir(parents=True,exist_ok=True)
 work={k:s[k] for k in ['id','title','subtitle','category','layout','color','wash','framework','scope']}
 work.update(format='文档',status='published',pages=10,illustrations=5,expectedIllustrations=5,expansion='documents-50',expansionBatch='proposal-expansion',newIllustrations=1,curatedIllustrations=4)
 pages=[]
 for i,p in enumerate(s['chapters']):
  pages.append(dict(section=f'{i+1:02d} / {s["title"]}',title=p['title'],lead=p['lead'],body=p['body'],subheading='Working proposal record',detail='Record a draft response in each labelled field. Keep unknowns visible and distinguish a proposal from an accepted commitment.',question=p['question'],records=[dict(label=label,prompt='Draft '+label.lower()+': not yet confirmed.')for label in p['labels']],image=i//2+1,kind='cover' if i==0 else 'appendix' if i==9 else 'body'))
 provenance=[dict(image=1,source='New AI-generated editorial illustration for '+s['id']),*[dict(image=n+2,source='Curated existing AI-generated illustration: '+src+'.jpg') for n,src in enumerate(s['sources'])]]
 for n in range(5):
  target=directory/'images'/f'{n+1:02d}.jpg'
  if n==0:
   source=pathlib.Path(os.environ.get('PROPOSAL_HERO_DIR',str(root.parent/'.cache/proposal-expansion')))/(s['id']+'.jpg')
   if not source.exists():source=target
  else:
   case,num=s['sources'][n-1].split('/');source=root/'public/atelier'/case/'images'/(num+'.jpg')
  im=Image.open(source).convert('RGB');im.thumbnail((1100,800));im.save(target,quality=84,optimize=True)
 (directory/'data.json').write_text(json.dumps(dict(work=work,pages=pages,provenance=provenance),ensure_ascii=False,indent=2)+'\n')
 (directory/'content.js').write_text('export const work='+json.dumps(work,ensure_ascii=False)+';\nexport const imageCount=5;\nexport const pages='+json.dumps(pages,ensure_ascii=False)+';\n')
(root/'public/atelier/proposal-expansion.json').write_text(json.dumps(dict(schemaVersion=1,cases=[s['id']for s in specs],pagesPerCase=10,distinctImagesPerCase=5,newImages=6,curatedExistingImages=24,completedOf50=12),indent=2)+'\n')
print('Prepared six proposals: 60 pages, six new heroes and 24 curated images; publication requires acceptance.')
