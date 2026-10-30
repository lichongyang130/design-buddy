// Actual Office Open XML IO. Never execute workbook formulas or download linked resources.
export const MIME_XLSX = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
export const MIME_DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
export function checkOfficeZip(bytes) {
  if (!(bytes instanceof Uint8Array) || bytes.length > 15 * 1024 * 1024) throw Error('Office file limit: 15 MB')
  const d = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  let end = -1
  for (let i=bytes.length-22;i>=Math.max(0,bytes.length-65557);i--) if(d.getUint32(i,true)===0x06054b50){end=i;break}
  if(end<0) throw Error('Invalid Office ZIP')
  const count=d.getUint16(end+10,true),start=d.getUint32(end+16,true)
  if(count>5000||count===65535||start>=bytes.length) throw Error('ZIP limits exceeded')
  let at=start,total=0
  for(let i=0;i<count;i++){
    if(at+46>bytes.length||d.getUint32(at,true)!==0x02014b50)throw Error('Invalid ZIP directory')
    const size=d.getUint32(at+24,true),length=d.getUint16(at+28,true),extra=d.getUint16(at+30,true),comment=d.getUint16(at+32,true)
    total+=size
    if(size>30*1024*1024||total>60*1024*1024||(d.getUint16(at+8,true)&1))throw Error('Encrypted or expanded ZIP exceeds limits')
    const name=new TextDecoder().decode(bytes.subarray(at+46,at+46+length))
    if(/vbaProject|externalLinks\//i.test(name))throw Error('Macros and external workbook links are not supported')
    at+=46+length+extra+comment
  }
}
export function safeFormula(text) {
  if(text.length>2000||/[\[\]|]|(?:https?:|file:|WEBSERVICE\s*\(|HYPERLINK\s*\(|RTD\s*\(|DDE\s*\(|IMPORTXML\s*\(|IMPORTDATA\s*\()/i.test(text)) throw Error('External or oversized formulas are not allowed')
  return text
}
export async function loadWorkbook(bytes) {
  checkOfficeZip(bytes)
  const {default:ExcelJS}=await import('exceljs')
  const book=new ExcelJS.Workbook();await book.xlsx.load(bytes)
  let cells=0
  if(book.worksheets.length>40)throw Error('Workbook sheet limit: 40')
  for(const sheet of book.worksheets){
    if(sheet.rowCount>100000||sheet.columnCount>1000)throw Error('Worksheet dimension limit exceeded')
    sheet.eachRow(row=>row.eachCell(cell=>{if(++cells>100000)throw Error('Workbook cell limit: 100000');if(cell.formula)safeFormula(cell.formula)}))
  }
  return book
}
export function workbookView(book, sheetId, offset=0) {
  const sheet=book.getWorksheet(Number(sheetId))||book.worksheets[0]
  if(!sheet)throw Error('No worksheet')
  offset=Math.max(0,Math.min(Number(offset)||0,Math.max(0,sheet.rowCount-1)))
  const rows=[]
  for(let r=offset+1;r<=Math.min(sheet.rowCount,offset+40);r++){
    const cells=[]
    for(let c=1;c<=Math.min(30,sheet.columnCount||10);c++){
      const cell=sheet.getCell(r,c)
      cells.push({address:cell.address,text:cell.formula?'='+cell.formula:cell.text,value:cell.value instanceof Date?cell.value.toISOString():typeof cell.value==='number'||typeof cell.value==='boolean'?cell.value:null})
    }
    rows.push(cells)
  }
  return {sheets:book.worksheets.map(s=>({id:s.id,name:s.name})),sheet:sheet.id,rows,rowCount:sheet.rowCount,columnCount:sheet.columnCount,offset}
}
export function patchWorkbook(book,{sheet,address,value,type='text'}) {
  const target=book.getWorksheet(Number(sheet))
  if(!target||!/^\$?[A-Z]{1,3}\$?[1-9]\d{0,5}$/.test(address)||String(value).length>5000)throw Error('Invalid cell or value')
  const cell=target.getCell(address)
  if(cell.row>100000||cell.col>1000)throw Error('Cell outside supported area')
  if(type==='formula')cell.value={formula:safeFormula(String(value).replace(/^=/,''))}
  else if(type==='number'){if(!String(value).trim()||!Number.isFinite(Number(value)))throw Error('Invalid number');cell.value=Number(value)}
  else cell.value=String(value)
  book.calcProperties.fullCalcOnLoad=true
}
export async function exportWorkbook(book){return new Uint8Array(await book.xlsx.writeBuffer())}

export async function markdownDocx(markdown) {
  if(typeof markdown!=='string'||!markdown.trim()||markdown.length>300000)throw Error('Markdown requires 1–300000 characters')
  const [{default:MarkdownIt},D]=await Promise.all([import('markdown-it'),import('docx')])
  const tokens=new MarkdownIt({html:false,linkify:false}).parse(markdown,{})
  if(tokens.length>12000)throw Error('Markdown structure exceeds 12000 tokens')
  const children=[];let heading,bullet=false,ordered=false,inTable=false,rows=[],cells=[],cellChildren=[]
  function inline(token){
    const runs=[];let bold=false,italics=false,href=null
    for(const t of token.children||[]){
      if(t.type==='strong_open')bold=true;else if(t.type==='strong_close')bold=false
      else if(t.type==='em_open')italics=true;else if(t.type==='em_close')italics=false
      else if(t.type==='link_open'){const url=t.attrGet('href');href=/^(https?:|mailto:)/i.test(url||'')?url:null}
      else if(t.type==='link_close')href=null
      else {
        const text=t.type==='image'?`[Image: ${t.content}; ${t.attrGet('src')||''}]`:t.content||''
        const run=new D.TextRun({text,bold,italics,font:t.type==='code_inline'?'Courier New':undefined,break:t.type==='softbreak'||t.type==='hardbreak'?1:undefined})
        runs.push(href?new D.ExternalHyperlink({link:href,children:[run]}):run)
      }
    }
    return runs
  }
  const add=p=>{if(inTable)cellChildren.push(p);else children.push(p)}
  for(const t of tokens){
    if(t.type==='heading_open')heading=D.HeadingLevel['HEADING_'+t.tag.slice(1)]
    else if(t.type==='heading_close')heading=undefined
    else if(t.type==='bullet_list_open')bullet=true
    else if(t.type==='bullet_list_close')bullet=false
    else if(t.type==='ordered_list_open')ordered=true
    else if(t.type==='ordered_list_close')ordered=false
    else if(t.type==='table_open'){inTable=true;rows=[]}
    else if(t.type==='tr_open')cells=[]
    else if(t.type==='th_open'||t.type==='td_open')cellChildren=[]
    else if(t.type==='th_close'||t.type==='td_close')cells.push(new D.TableCell({children:cellChildren.length?cellChildren:[new D.Paragraph('')]}))
    else if(t.type==='tr_close')rows.push(new D.TableRow({children:cells}))
    else if(t.type==='table_close'){inTable=false;children.push(new D.Table({rows,width:{size:100,type:D.WidthType.PERCENTAGE}}))}
    else if(t.type==='inline')add(new D.Paragraph({children:inline(t),heading,bullet:bullet?{level:0}:undefined,numbering:ordered?{reference:'ordered',level:0}:undefined,spacing:{after:160}}))
    else if(t.type==='fence'||t.type==='code_block')add(new D.Paragraph({children:[new D.TextRun({text:t.content,font:'Courier New'})]}))
    else if(t.type==='hr')add(new D.Paragraph('────────'))
  }
  const document=new D.Document({numbering:{config:[{reference:'ordered',levels:[{level:0,format:D.LevelFormat.DECIMAL,text:'%1.',alignment:D.AlignmentType.LEFT}]}]},sections:[{children}]})
  return new Uint8Array(await D.Packer.toArrayBuffer(document))
}
