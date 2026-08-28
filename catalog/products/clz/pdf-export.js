(function(){
  // The deck was designed and reviewed at Full HD. Keeping the capture viewport
  // at the same size prevents vw/clamp typography and grid spacing from reflowing.
  const WIDTH=1920, HEIGHT=1080, SCALE=1.5;

  function overlay(){
    let el=document.getElementById('pdf-export-overlay');
    if(el)return el;
    el=document.createElement('div');
    el.id='pdf-export-overlay';
    el.innerHTML='<div class="pdf-export-card"><div class="pdf-export-spinner"></div><strong>正在製作整份 PDF</strong><span id="pdf-export-progress">準備投影片...</span><small>完成後將自動下載，請勿關閉頁面</small></div>';
    document.body.appendChild(el);
    return el;
  }

  function ensureStyles(){
    if(document.getElementById('pdf-export-styles'))return;
    const style=document.createElement('style');
    style.id='pdf-export-styles';
    style.textContent=`
      #pdf-export-overlay{position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;background:rgba(3,18,25,.82);backdrop-filter:blur(10px);color:#fff;font-family:var(--font-zh),sans-serif}
      .pdf-export-card{width:min(420px,84vw);padding:30px;border:1px solid rgba(255,255,255,.2);border-radius:20px;background:#073849;text-align:center;box-shadow:0 22px 70px rgba(0,0,0,.38)}
      .pdf-export-card strong,.pdf-export-card span,.pdf-export-card small{display:block}.pdf-export-card strong{font-size:22px}.pdf-export-card span{margin-top:12px;color:#6ee7df;font-size:16px;font-weight:700}.pdf-export-card small{margin-top:8px;color:rgba(255,255,255,.62)}
      .pdf-export-spinner{width:42px;height:42px;margin:0 auto 18px;border:4px solid rgba(255,255,255,.18);border-top-color:#47d7cf;border-radius:50%;animation:pdfspin .8s linear infinite}@keyframes pdfspin{to{transform:rotate(360deg)}}
      .pdf-capture-slide{display:flex!important;position:fixed!important;inset:auto!important;left:0!important;top:0!important;width:${WIDTH}px!important;height:${HEIGHT}px!important;min-height:${HEIGHT}px!important;z-index:999999!important;transform:none!important}
      .pdf-capture-slide .animate-line{opacity:1!important;animation:none!important;transform:none!important}
      .pdf-capture-slide .clz-time-track article,.pdf-capture-slide .clz-waiver-span{opacity:1!important;filter:none!important}
    `;
    document.head.appendChild(style);
  }

  async function settle(slide){
    if(document.fonts&&document.fonts.ready)await document.fonts.ready;
    const images=[...slide.querySelectorAll('img')];
    await Promise.all(images.map(img=>img.complete?Promise.resolve():new Promise(resolve=>{img.addEventListener('load',resolve,{once:true});img.addEventListener('error',resolve,{once:true});})));
    await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
  }

  window.downloadFullDeckPDF=async function(productCode){
    if(window.__pdfExporting)return;
    window.__pdfExporting=true;
    ensureStyles();
    const mask=overlay();
    const progress=mask.querySelector('#pdf-export-progress');
    mask.style.display='flex';
    const slides=[...document.querySelectorAll('.deck > .slide')];
    const originalStyles=slides.map(slide=>slide.getAttribute('style'));
    const originalHtmlClass=document.documentElement.className;
    try{
      if(!window.html2canvas||!window.jspdf||!window.jspdf.jsPDF)throw new Error('PDF 元件載入失敗，請重新整理後再試。');
      document.documentElement.classList.remove('scroll-mode','grid-mode');
      const {jsPDF}=window.jspdf;
      const pdf=new jsPDF({orientation:'landscape',unit:'px',format:[WIDTH,HEIGHT],compress:true,hotfixes:['px_scaling']});
      for(let i=0;i<slides.length;i++){
        const slide=slides[i];
        progress.textContent=`正在輸出第 ${i+1} / ${slides.length} 頁`;
        slide.classList.add('pdf-capture-slide');
        await settle(slide);
        const canvas=await html2canvas(slide,{width:WIDTH,height:HEIGHT,windowWidth:WIDTH,windowHeight:HEIGHT,scale:SCALE,useCORS:true,allowTaint:true,backgroundColor:null,logging:false,imageTimeout:15000});
        if(i>0)pdf.addPage([WIDTH,HEIGHT],'landscape');
        pdf.addImage(canvas.toDataURL('image/jpeg',.96),'JPEG',0,0,WIDTH,HEIGHT,undefined,'FAST');
        slide.classList.remove('pdf-capture-slide');
        if(originalStyles[i]===null)slide.removeAttribute('style');else slide.setAttribute('style',originalStyles[i]);
        await new Promise(resolve=>setTimeout(resolve,20));
      }
      progress.textContent='PDF 已完成，正在下載...';
      const stamp=new Date().toISOString().slice(0,10).replaceAll('-','');
      pdf.save(`${String(productCode||'商品').toUpperCase()}-完整簡報-${stamp}.pdf`);
    }catch(error){
      console.error(error);
      alert(error&&error.message?error.message:'PDF 匯出失敗，請重新整理後再試。');
    }finally{
      slides.forEach((slide,i)=>{slide.classList.remove('pdf-capture-slide');if(originalStyles[i]===null)slide.removeAttribute('style');else slide.setAttribute('style',originalStyles[i]);});
      document.documentElement.className=originalHtmlClass;
      mask.style.display='none';
      window.__pdfExporting=false;
      if(typeof render==='function')render();
    }
  };
})();

// Keep the product return links correct both inside Catalog and as a standalone ZIP.
function gpCatalogNavigate(event,target){
  const embedded=/\/products\/(clz|clx)\//i.test(location.pathname);
  if(embedded)return true;
  event.preventDefault();
  const fallback=target==='products'
    ? 'https://godzillapaul.github.io/Catalog_GodzillaPaul/products.html'
    : 'https://godzillapaul.github.io/Catalog_GodzillaPaul/';
  if(document.referrer){
    try{
      const ref=new URL(document.referrer);
      if(ref.origin===location.origin){history.back();return false;}
    }catch(_error){}
  }
  location.href=fallback;
  return false;
}
