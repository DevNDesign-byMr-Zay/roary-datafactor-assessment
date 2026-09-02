function pluck(payload){
          if(!payload)return[];
          if(Array.isArray(payload))return payload;
          if(Array.isArray(payload.results))return payload.results;
          if(Array.isArray(payload.web_results))return payload.web_results;
          if(Array.isArray(payload.items))return payload.items;
          if(payload.data && Array.isArray(payload.data.results))return payload.data.results;
          return[];
        }
