/* Aster JavaScript v183
Authenticated historical derivative: assistant-output post-processing before rich rendering.
Removes redundant presentation headings/source sections and prevents duplicate bounded summary blocks.
*/
(function(global){
  "use strict";
  if(global.AsterAssistantPostProcessor) return;

  function normalizeNewlines(value){
    return String(value == null ? "" : value).replace(/\r\n?/g,"\n");
  }

  function stripLeadingAnswerHeading(text){
    return text.replace(/^#{1,6}\s*answer\s*\n+/i,"");
  }

  function stripStandaloneSourcesSection(text){
    return text.replace(/\n+#{1,6}\s*sources\s*\n[\s\S]*?(\n-{3,}\s*|\s*$)/gi,"\n\n");
  }

  function truncateAfterDuplicateMarker(text,marker){
    const token=String(marker||"");
    if(!token) return text;
    const first=text.indexOf(token);
    if(first<0) return text;
    const second=text.indexOf(token,first+token.length);
    return second<0 ? text : text.slice(0,second).trimEnd();
  }

  function process(text,options={}){
    if(!text) return "";
    let value=normalizeNewlines(text);
    if(options.stripAnswerHeading!==false) value=stripLeadingAnswerHeading(value);
    if(options.stripSourcesSection!==false) value=stripStandaloneSourcesSection(value);
    const marker=options.summaryMarker===undefined
      ? "### Local Analysis Summary"
      : options.summaryMarker;
    value=truncateAfterDuplicateMarker(value,marker);
    return value.trim();
  }

  global.AsterAssistantPostProcessor={
    normalizeNewlines,
    stripLeadingAnswerHeading,
    stripStandaloneSourcesSection,
    truncateAfterDuplicateMarker,
    process
  };
})(window);
