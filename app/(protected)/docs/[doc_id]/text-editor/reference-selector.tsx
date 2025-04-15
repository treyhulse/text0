"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { useParams } from "next/navigation";
import type { Reference } from "@/lib/redis";
import { Skeleton } from "@/components/ui/skeleton";
import { useReferences } from "@/hooks/use-references";
import { useSelectedReferences } from "@/hooks/use-selected-references";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ReferenceSelector() {
  const { doc_id } = useParams();
  const { data: references, isLoading } = useReferences();
  const { isReferenceSelected, toggleReference } = useSelectedReferences(
    doc_id as string
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
    <ScrollArea className="h-[250px] rounded-md border p-1 space-y-1">
      {references?.map((reference: Reference) => (
        <div
          key={reference.id}
          className="flex items-center gap-1 py-1 px-2 hover:bg-accent rounded-md group"
        >
          <Checkbox
            id={reference.id}
            checked={isReferenceSelected(reference.id)}
            onCheckedChange={() => toggleReference(reference.id)}
          />
          <label
            htmlFor={reference.id}
            className="text-sm leading-none flex-1 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {reference.name ?? reference.filename}
          </label>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
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
        <p className="text-sm text-muted-foreground text-center py-4">
          No references found. Add some references first.
        </p>
      )}
    </ScrollArea>
  );
}
