/* TEXT AND BUTTON FLOOR for the whole Creator Kit (kit friction review, 17 Oct 2026; founder: "make this as
   seamless and easy... for the creator, especially because they're older").
   Measured on a phone: 40-65% of the text on most kit pages was under 15px, the smallest 9px, and several
   buttons were under the usual 44px finger size. One rule for every page instead of hand-tuning 7 files:
   - reading text under 16px goes up to 16px
   - small CAPITALS labels (eyebrows, tags) go up to at least 13px - they are labels, not reading text
   - 1-2 character badges (step numbers) are left alone - they sit inside fixed circles
   - real buttons get at least 44px of height
   It re-runs when a page adds content later (the Playbook loads its angle cards after the page). */
(function(){
  function floor(root){
    var els=(root||document.body).querySelectorAll('*');
    for(var i=0;i<els.length;i++){
      var e=els[i]; if(e.dataset.kfDone) continue;
      if(/^(SCRIPT|STYLE|IFRAME|VIDEO|IMG|SVG|PATH|INPUT|TEXTAREA|SELECT|OPTION|BR)$/i.test(e.tagName)) continue;
      var own=false; for(var c=e.firstChild;c;c=c.nextSibling){ if(c.nodeType===3&&c.textContent.trim()){ own=true; break; } }
      var cs=getComputedStyle(e);
      if(own){
        var f=parseFloat(cs.fontSize), txt=e.textContent.trim();
        if(txt.length>2){
          if(cs.textTransform==='uppercase'){ if(f<13) e.style.setProperty('font-size','13px','important'); }
          else if(f<16) e.style.setProperty('font-size','16px','important');
        }
      }
      if(e.tagName==='BUTTON' && e.offsetParent!==null && e.getBoundingClientRect().height<44) e.style.setProperty('min-height','44px','important');
      e.dataset.kfDone='1';
    }
  }
  function run(){ try{ floor(); }catch(e){} }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',run); else run();
  var t=null; try{ new MutationObserver(function(){ clearTimeout(t); t=setTimeout(run,150); }).observe(document.body||document.documentElement,{childList:true,subtree:true}); }catch(e){}
})();
