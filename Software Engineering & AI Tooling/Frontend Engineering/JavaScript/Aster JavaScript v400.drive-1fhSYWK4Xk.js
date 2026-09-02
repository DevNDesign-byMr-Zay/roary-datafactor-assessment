function normalize(arr){
          return (arr||[]).map(x=>({
            url:x.url || x.link || x.href || x.source || "",
            title:x.title || x.name || x.heading || "Untitled",
            snippet:x.snippet || x.description || x.content || x.body || x.text || ""
          }));
        }
