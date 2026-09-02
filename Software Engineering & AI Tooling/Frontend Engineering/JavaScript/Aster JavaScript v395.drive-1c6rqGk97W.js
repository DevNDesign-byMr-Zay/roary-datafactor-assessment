function updateUserTime(){
        const now = new Date();
        userContext.timeISO = now.toISOString();
        userContext.timePretty = now.toLocaleString();
        try{
          userContext.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        }catch{
          userContext.timezone = "local";
        }
      }
