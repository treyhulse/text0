"use client";
import { ThemeProvider } from "next-themes";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { ClerkProvider } from "@clerk/nextjs";
import { SidebarProvider } from "@/components/ui/sidebar";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

export const Providers = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient();

  return (
    <NuqsAdapter>
      <ClerkProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider
            attribute="class"
            disableTransitionOnChange
            defaultTheme="system"
          >
            <SidebarProvider defaultOpen={true}>{children}</SidebarProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </ClerkProvider>
    </NuqsAdapter>
  );
};
