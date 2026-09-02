export function bindAsterLightboxOnlyTool({tool,lightbox,miniTrigger}={}){
  const sync=()=>{
    const open=!!lightbox && !lightbox.hidden && lightbox.getAttribute('aria-hidden')!=='true';
    if(tool){ tool.hidden=!open; tool.setAttribute('aria-hidden',String(!open)); }
    if(miniTrigger){ miniTrigger.hidden=open; miniTrigger.setAttribute('aria-hidden',String(open)); }
  };
  const mo=new MutationObserver(sync); if(lightbox) mo.observe(lightbox,{attributes:true,attributeFilter:['hidden','aria-hidden','class']}); sync();
  return ()=>mo.disconnect();
}
