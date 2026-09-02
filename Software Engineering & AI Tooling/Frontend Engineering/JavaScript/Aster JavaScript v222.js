/* Aster JavaScript v222 — authenticated buyer-safe derivative: sidebar tab-state and panel-visibility synchronization. Host state/dependencies are intentionally external. */
function setTab(which){
    $("#tabChats").classList.toggle("active", which==="chats");
    $("#tabMedia").classList.toggle("active", which==="media");
    $("#tabCfg").classList.toggle("active", which==="cfg");
    $("#tabDiag").classList.toggle("active", which==="diag");
    $("#listChats").style.display = which==="chats" ? "" : "none";
    $("#listMedia").style.display = which==="media" ? "" : "none";
    $("#listCfg").style.display   = which==="cfg" ? "" : "none";
    $("#listDiag").style.display  = which==="diag" ? "" : "none";
    if(which==="diag") renderDiag();
  }
