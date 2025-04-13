import { useQueryState } from "nuqs";

export function useModel() {
  return useQueryState("model", {
    defaultValue: "gpt-4o-mini",
  });
}
