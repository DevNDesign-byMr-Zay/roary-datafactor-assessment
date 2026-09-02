export function createAsterPreviewRestorer(image){
  if(!image)return {apply(){},restore(){}};
  let base=image.style.filter;
  return {capture(){base=image.style.filter},apply(filter){image.dataset.asterRelightPreview='1';image.style.filter=filter||base},restore(){image.style.filter=base;delete image.dataset.asterRelightPreview}};
}
