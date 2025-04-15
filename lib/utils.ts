import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type ActionState<T = unknown, S = unknown> = {
  success: boolean;
  error?: string;
  form?: T;
  data?: S;
};
