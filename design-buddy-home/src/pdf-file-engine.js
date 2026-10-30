import * as pdfjs from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
pdfjs.GlobalWorkerOptions.workerSrc=workerUrl
export async function openPdf(bytes,password) {
  if(!(bytes instanceof Uint8Array)||bytes.length>20*1024*1024||new TextDecoder().decode(bytes.subarray(0,5))!=='%PDF-')throw Error('Upload a PDF up to 20 MB')
  const task=pdfjs.getDocument({data:bytes,password,isEvalSupported:false,maxImageSize:16000000,canvasMaxAreaInBytes:33554432,enableXfa:false,disableFontFace:false,useSystemFonts:true,cMapUrl: "/vendor/pdfjs/cmaps/",cMapPacked:true,standardFontDataUrl:"/vendor/pdfjs/standard_fonts/",wasmUrl:"/vendor/pdfjs/wasm/"})
  const pdf=await task.promise
  if(pdf.numPages>200){await pdf.destroy();throw Error('PDF page limit: 200')}
  return pdf
}
export async function extractPdf(pdf) {
  const pages=[];let count=0
  for(let n=1;n<=pdf.numPages;n++){
    const page=await pdf.getPage(n),content=await page.getTextContent()
    const text=content.items.map(i=>i.str+(i.hasEOL?'\n':' ')).join('').trim()
    count+=text.length;if(count>2*1024*1024)throw Error('Extracted text exceeds 2 MB')
    pages.push({page:n,text,needsOCR:!text.trim()});page.cleanup()
  }
  return {pages,pageCount:pdf.numPages,ocrPages:pages.filter(p=>p.needsOCR).map(p=>p.page),outline:await pdf.getOutline()}
}
