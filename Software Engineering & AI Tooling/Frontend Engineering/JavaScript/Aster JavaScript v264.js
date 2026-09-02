/* Aster JavaScript v264 — authenticated buyer-safe derivative: relight mood preview filter derivation. Host state/dependencies are intentionally external. */
function presetFor(mood){
    const m=String(mood||'Cinematic').toLowerCase();
    if(m==='neutral') return {filter:(i)=>`contrast(${1.08+0.06*i}) saturate(${1.02+0.05*i}) brightness(${1.0+0.02*i})`, overlay:(i)=>`radial-gradient(70% 60% at 50% 40%, rgba(255,255,255,${0.06+0.03*i}) 0%, rgba(0,0,0,0) 70%)`, op:(i)=>0.18+0.05*i};
    if(m==='studio') return {filter:(i)=>`contrast(${1.15+0.07*i}) saturate(${1.05+0.03*i}) brightness(${1.03+0.03*i})`, overlay:(i)=>`radial-gradient(65% 55% at 46% 38%, rgba(255,255,255,${0.10+0.04*i}) 0%, rgba(0,0,0,0) 72%)`, op:(i)=>0.22+0.05*i};
    if(m==='neon') return {filter:(i)=>`contrast(${1.18+0.08*i}) saturate(${1.25+0.12*i}) brightness(${0.98+0.03*i}) hue-rotate(${6+5*i}deg)`, overlay:(i)=>`radial-gradient(55% 55% at 30% 35%, rgba(255,0,200,${0.16+0.05*i}) 0%, rgba(0,0,0,0) 60%), radial-gradient(60% 60% at 70% 55%, rgba(0,255,255,${0.14+0.05*i}) 0%, rgba(0,0,0,0) 62%)`, op:(i)=>0.28+0.06*i};
    if(m==='sunset') return {filter:(i)=>`contrast(${1.12+0.07*i}) saturate(${1.10+0.09*i}) brightness(${1.0+0.02*i})`, overlay:(i)=>`linear-gradient(120deg, rgba(255,120,0,${0.14+0.05*i}) 0%, rgba(255,0,90,${0.10+0.04*i}) 45%, rgba(0,0,0,0) 78%)`, op:(i)=>0.26+0.06*i};
    if(m==='dawn') return {filter:(i)=>`contrast(${1.10+0.06*i}) saturate(${1.03+0.06*i}) brightness(${1.02+0.02*i})`, overlay:(i)=>`linear-gradient(120deg, rgba(80,140,255,${0.12+0.05*i}) 0%, rgba(0,255,200,${0.08+0.04*i}) 48%, rgba(0,0,0,0) 80%)`, op:(i)=>0.24+0.05*i};
    return {filter:(i)=>`contrast(${1.16+0.08*i}) saturate(${1.10+0.08*i}) brightness(${1.0+0.02*i})`, overlay:(i)=>`linear-gradient(120deg, rgba(255,140,0,${0.10+0.04*i}) 0%, rgba(0,150,255,${0.10+0.04*i}) 55%, rgba(0,0,0,0) 82%)`, op:(i)=>0.25+0.06*i}; // cinematic default
  }
