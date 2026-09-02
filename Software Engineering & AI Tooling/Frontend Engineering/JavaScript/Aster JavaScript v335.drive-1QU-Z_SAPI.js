function makeThread(){
    const id = uuid();
    const now = Date.now();
    return {
      id,
      title: "New Chat",
      createdAt: now,
      updatedAt: now,
      messages: []
    };
  }
