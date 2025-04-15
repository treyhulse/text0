"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useReferences } from "@/hooks/use-references";
import { useSelectedReferences } from "@/hooks/use-selected-references";
import type { Reference } from "@/lib/redis";
import { ExternalLink } from "lucide-react";
import { useParams } from "next/navigation";

export function ReferenceSelector() {
  const { doc_id } = useParams();
  const { data: references, isLoading } = useReferences();
  const { isReferenceSelected, toggleReference } = useSelectedReferences(
    doc_id as string,
  );

  if (isLoading) {
    return (
      <div className="h-[250px] space-y-1 p-1">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

  return (
    <ScrollArea className="h-[250px] space-y-1 rounded-md border p-1">
      {references?.map((reference: Reference) => (
        <div
          key={reference.id}
          className="group flex items-center gap-1 rounded-md px-2 py-1 hover:bg-accent"
        >
          <Checkbox
            id={reference.id}
            checked={isReferenceSelected(reference.id)}
            onCheckedChange={() => toggleReference(reference.id)}
          />
          <label
            htmlFor={reference.id}
            className="flex-1 text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {reference.name ?? reference.filename}
          </label>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
            asChild
            aria-label={`Open ${
              reference.name ?? reference.filename
            } in new tab`}
          >
            <a
              href={reference.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Open ${
                reference.name ?? reference.filename
              } in new tab`}
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </div>
      ))}
      {references?.length === 0 && (
        <p className="py-4 text-center text-muted-foreground text-sm">
          No references found. Add some references first.
        </p>
      )}
    </ScrollArea>
  );
}
