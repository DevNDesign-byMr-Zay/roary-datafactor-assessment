(function (g) {
  'use strict';
  function asList(value){
    if(Array.isArray(value)) return value;
    if(value&&Array.isArray(value.threads)) return value.threads;
    if(value&&Array.isArray(value.conversations)) return value.conversations;
    if(value&&Array.isArray(value.items)) return value.items;
    if(value&&typeof value==='object') return Object.values(value).filter(function(x){return x&&typeof x==='object';});
    return [];
  }
  function normalize(value){return asList(value).map(function(t,i){
    var x=t||{}; return {id:String(x.id||x.threadId||x.conversationId||('thread-'+i)),title:String(x.title||x.name||'Conversation'),pinned:Boolean(x.pinned),archived:Boolean(x.archived),updatedAt:Number(x.updatedAt||x.updated_at||x.timestamp||0),messages:Array.isArray(x.messages)?x.messages:[]};
  });}
  function repairActive(activeId,threads){var list=normalize(threads); return list.some(function(x){return x.id===String(activeId||'');})?String(activeId):((list[0]&&list[0].id)||null);}
  g.AsterConversationNormalize={asList:asList,normalize:normalize,repairActive:repairActive};
})(window);
