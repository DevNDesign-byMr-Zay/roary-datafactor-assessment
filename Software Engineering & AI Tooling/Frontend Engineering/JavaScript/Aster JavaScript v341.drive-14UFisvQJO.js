function setTab(which){
    $("#tabChats").classList.toggle("active", which==="chats");
    $("#tabMedia").classList.toggle("active", which==="media");
    $("#tabCfg").classList.toggle("active", which==="cfg");
    $("#listChats").style.display = which==="chats" ? "" : "none";
    $("#listMedia").style.display = which==="media" ? "" : "none";
    $("#listCfg").style.display   = which==="cfg" ? "" : "none";
  }
