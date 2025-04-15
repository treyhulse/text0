"use client";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ClerkProvider } from "@clerk/nextjs";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { NuqsAdapter } from "nuqs/adapters/next/app";

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
