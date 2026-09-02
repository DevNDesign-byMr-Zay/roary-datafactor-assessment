function postProcessAssistantText(text) {
        if (!text) return "";

        let t = text;

        // 1) Strip a leading "### Answer" or similar heading
        t = t.replace(/^#{1,6}\s*answer\s*\n+/i, "");

        // 2) Remove any standalone "### Sources" section – UI handles sources
        t = t.replace(/\n+#{1,6}\s*Sources\s*\n[\s\S]*?(\n-{3,}\s*|\s*$)/gi, "\n\n");

        // 3) Prevent duplicate Local Vision/OCR sections
        const lvMarker = "### Local Vision/OCR Summary";
        const firstIdx = t.indexOf(lvMarker);
        if (firstIdx !== -1) {
          const secondIdx = t.indexOf(lvMarker, firstIdx + lvMarker.length);
          if (secondIdx !== -1) {
            t = t.slice(0, secondIdx).trimEnd();
          }
        }

        return t.trim();
      }
