const Base64Prefix = 'data:application/pdf;base64,';
function getPdfHandler() {
  return window['pdfjs-dist/build/pdf'];
}


let drawing = JSON.parse(localStorage.getItem('drawing'));
const init=()=>{
  if (drawing[0]) document.getElementById('canvasimg1').src = drawing;
}



const canvas = new fabric.Canvas('c');
document.querySelector('input').addEventListener('change', async (e) => {
  await Promise.all(pdfToImage(e.target.files[0], canvas));
  console.log(e.target.files[0]);
});

async function pdfToImage(pdfData, canvas) {
  const scale = 4 / window.devicePixelRatio;
  return (await printPDF(pdfData)).map(async (item,index) => {
    if (index>0)return
    console.log(item)
      canvas.add(
        new fabric.Image(await item, {
          id:'pdf',
          scaleX: scale/4,
          scaleY: scale/4,
        })
      );
  });
}
async function printPDF(pdfData, pages) {
  const pdfjsLib = await getPdfHandler();
  pdfData = pdfData instanceof Blob ? await readBlob(pdfData) : pdfData;
  const data = atob(
    pdfData.startsWith(Base64Prefix)
      ? pdfData.substring(Base64Prefix.length)
      : pdfData
  );
  // Using DocumentInitParameters object to load binary data.
  const loadingTask = pdfjsLib.getDocument({ data });
  return loadingTask.promise.then((pdf) => {
    const numPages = pdf.numPages;
    return new Array(numPages).fill(0).map((__, i) => {
      const pageNumber = i + 1;
      if (pages && pages.indexOf(pageNumber) == -1) {
        return;
      }
      return pdf.getPage(pageNumber).then((page) => {
        //  retina scaling
        const viewport = page.getViewport({ scale: window.devicePixelRatio });
        // Prepare canvas using PDF page dimensions
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        // Render PDF page into canvas context
        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };
        const renderTask = page.render(renderContext);
        return renderTask.promise.then(() => canvas);
      });
    });
  });
}

function readBlob(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => resolve(reader.result));
    reader.addEventListener('error', reject);
    reader.readAsDataURL(blob);
  });
}

const chooseSign = document.getElementById('chooseSign');
chooseSign.addEventListener('click',(e)=>{

  if (e.target.nodeName!=='IMG')return
  
  const  sign = drawing; 
  fabric.Image.fromURL(sign, function (sign) {
    sign.id='sign'
     canvas.add(sign);
  });
})
const picture = document.querySelector('.canvas-container');
picture.addEventListener('mouseup', () => {
  canvas.getObjects().forEach(item=> {
    if (item.id == 'sign') {
      canvas.setActiveObject(item);
    }
  });
});

const download = document.getElementById('download');
download.addEventListener('click',()=>{
  canvas.discardActiveObject().renderAll();
   html2canvas(document.getElementById('c'),{
    onrendered:(canvas)=>{
       return Canvas2Image.saveAsPNG(canvas);
    }
   })
})