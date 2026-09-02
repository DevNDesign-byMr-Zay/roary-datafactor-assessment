function persistConversations(){
        localStorage.setItem("aster.conversations",JSON.stringify(conversationsArr));
        localStorage.setItem("aster.activeId",activeId||"");
      }
