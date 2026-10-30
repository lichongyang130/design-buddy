import {loadWorkbook,workbookView,patchWorkbook,exportWorkbook} from './office-file-engines.js'
let book
self.onmessage=async({data:{id,op,payload}})=>{try{
  let result
  if(op==='load'){book=null;book=await loadWorkbook(new Uint8Array(payload));result=workbookView(book)}
  else if(!book)throw Error('Upload a workbook first')
  else if(op==='view')result=workbookView(book,payload.sheet,payload.offset)
  else if(op==='patch'){patchWorkbook(book,payload);result=workbookView(book,payload.sheet,payload.offset)}
  else if(op==='export')result=await exportWorkbook(book)
  else throw Error('Unknown workbook operation')
  self.postMessage({id,result},result instanceof Uint8Array?[result.buffer]:[])
}catch(e){self.postMessage({id,error:e.message})}}
