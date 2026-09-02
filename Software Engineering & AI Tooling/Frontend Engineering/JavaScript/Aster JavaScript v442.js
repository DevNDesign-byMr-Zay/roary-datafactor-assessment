async function removeCurrentModalImage(req){
    const prompt = (req && typeof req === "object")
      ? (req.prompt ?? req.text ?? req.userPrompt ?? "")
      : String(req||"");
    return await removeViaBackend(prompt, {});
  }
