"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NotesCard({ notes }: { notes?: string | null }) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Notes</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm">
          {notes ? notes : "No notes."}
        </p>
      </CardContent>
    </Card>
  );
}
