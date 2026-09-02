const mood=()=>{
    const g=document.getElementById('asterRelightMoodGrid');
    const b=g&&g.querySelector('button[data-mood].is-active');
    return (b&&b.getAttribute('data-mood')) || (document.getElementById('rtpRelightMoodVal')?.textContent||'Cinematic').trim();
  };
