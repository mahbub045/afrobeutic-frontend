"use client";

import { useEffect, useState } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface GuideSection {
  id: string;
  title: string;
  description?: string;
}

export interface UserGuideSidebarProps {
  title?: string;
  description?: string;
  sections: GuideSection[];
  onNavigate: (sectionId: string) => void;
}

export default function UserGuideSidebar({
  title = "User Guide",
  description = "One page — use the menu to jump.",
  sections,
  onNavigate,
}: UserGuideSidebarProps) {
  const [activeSection, setActiveSection] = useState<string>(
    sections[0]?.id ?? "",
  );

  useEffect(() => {
    const hashSectionId = window.location.hash.replace("#", "");
    if (
      hashSectionId &&
      sections.some((section) => section.id === hashSectionId)
    ) {
      setActiveSection(hashSectionId);
      return;
    }

    if (sections[0]?.id) {
      setActiveSection(sections[0].id);
    }
  }, [sections]);

  return (
    <Card className="border-border/60 bg-background/50 h-full md:flex md:flex-col">
      <CardHeader className="border-b">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="p-4 md:flex-1 md:overflow-y-auto">
        <nav aria-label="User guide sections">
          <ul className="space-y-1">
            {sections.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  onClick={(event) => {
                    event.preventDefault();
                    setActiveSection(section.id);
                    onNavigate(section.id);
                  }}
                  className={cn(
                    "flex items-center rounded-md px-3 py-2 text-sm transition-colors",
                    activeSection === section.id
                      ? "bg-accent text-primary shadow-md dark:shadow-gray-600"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  )}
                  aria-current={
                    activeSection === section.id ? "location" : undefined
                  }
                >
                  {section.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </CardContent>
    </Card>
  );
}
