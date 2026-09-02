function wantsMedia(text){
        if(!text) return false;
        const q = text.toLowerCase();
        if(
          q.includes("show me images") ||
          q.includes("pull images") ||
          q.includes("image references") ||
          q.includes("image refs") ||
          q.includes("pictures of") ||
          q.includes("photos of") ||
          q.includes("photo references") ||
          q.includes("reference images") ||
          q.includes("image inspo") ||
          q.includes("moodboard") ||
          q.includes("inspiration board") ||
          q.includes("show me videos") ||
          q.includes("pull videos") ||
          q.includes("video references") ||
          q.includes("video refs") ||
          q.includes("clips of") ||
          q.includes("video inspo") ||
          q.includes("reel ideas") ||
          q.includes("tiktok ideas") ||
          q.includes("youtube ideas")
        ){
          return true;
        }
        return false;
      }
