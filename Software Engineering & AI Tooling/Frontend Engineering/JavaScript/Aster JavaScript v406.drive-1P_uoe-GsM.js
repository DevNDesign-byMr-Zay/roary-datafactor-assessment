function mountImageGallery(chatInnerEl, afterMsgEl, images, query){
        return mountMediaGallery(chatInnerEl, afterMsgEl, { images: images || [], videos: [] }, query);
      }
