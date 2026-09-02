function setModel(val){
        currentModel=val;
        localStorage.setItem("aster.model",currentModel);
        leftSelect.setLabel(currentModel);
        topSelect.setLabel(currentModel);
      }
