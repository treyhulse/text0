"use client";

import { useCompletion } from "@ai-sdk/react";

export default function Page() {
  const { completion, input, handleInputChange, handleSubmit, error } = useCompletion({
    api: "/api/completion",
  });

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="prompt"
        value={input}
        onChange={handleInputChange}
        id="input"
      />
      <button type="submit">Submit</button>
      <div>Completion: {completion}</div>
      <div>Error: {error?.message}</div>
    </form>
  );
}
