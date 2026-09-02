const stopProgress=()=>{try{pollTimer&&clearInterval(pollTimer)}catch(e){}try{fakeTimer&&clearInterval(fakeTimer)}catch(e){}pollTimer=null;fakeTimer=null;};
