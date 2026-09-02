export class AsterRelightMoodState {
  constructor({defaultMood='neutral', onChange}={}){ this.mood=String(defaultMood); this.onChange=onChange; }
  set(mood, root=document){
    this.mood=String(mood||this.mood).trim() || this.mood;
    root.querySelectorAll?.('[data-aster-mood]').forEach(el=>{
      const active=el.getAttribute('data-aster-mood')===this.mood;
      el.classList.toggle('is-active',active); el.setAttribute('aria-pressed',String(active));
    });
    this.onChange?.(this.mood); return this.mood;
  }
  bind(root=document){
    root.addEventListener('click',e=>{ const el=e.target.closest?.('[data-aster-mood]'); if(el) this.set(el.getAttribute('data-aster-mood'),root); });
    this.set(this.mood,root); return this;
  }
}
