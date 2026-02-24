"use client";

import * as React from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import UserGuideSidebar, {
  type GuideSection,
} from "@/components/UserGuide/UserGuideSidebar";

const SECTIONS: GuideSection[] = [
  {
    id: "overview",
    title: "Overview",
    description: "Quick orientation for using Afrobeutic.",
  },
  {
    id: "accounts",
    title: "Accounts & Switching",
    description: "How to switch between accounts within one session.",
  },
  {
    id: "bookings",
    title: "Bookings",
    description: "Creating, viewing, and managing bookings.",
  },
  {
    id: "profile",
    title: "Profile",
    description: "Updating your personal details and preferences.",
  },
  {
    id: "support",
    title: "Support",
    description: "Where to go when something isn’t working.",
  },
];

function scrollToSection(sectionId: string) {
  const target = document.getElementById(sectionId);
  if (!target) return;

  // Keep URL in sync for shareable deep links.
  if (typeof window !== "undefined") {
    window.history.replaceState(null, "", `#${sectionId}`);
  }

  target.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function UserGuidePage() {
  React.useEffect(() => {
    const hash = window.location.hash?.replace("#", "");
    if (!hash) return;

    // Defer to ensure layout is painted before scrolling.
    window.requestAnimationFrame(() => scrollToSection(hash));
  }, []);

  return (
    <div className="w-full px-4 py-8">
      <div className="flex flex-col gap-6 md:block">
        <aside className="md:fixed md:top-16 md:left-0 md:h-[calc(100vh-4rem)] md:w-72 md:p-4">
          <UserGuideSidebar sections={SECTIONS} onNavigate={scrollToSection} />
        </aside>

        <main className="min-w-0 flex-1 md:ml-72 md:pl-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Under construction</CardTitle>
                <CardDescription>
                  This guide is being written — sections below are placeholders.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Click any section in the sidebar to scroll.
                </p>
              </CardContent>
            </Card>

            {SECTIONS.map((section) => (
              <section
                key={section.id}
                id={section.id}
                className="scroll-mt-24"
              >
                <Card>
                  <CardHeader>
                    <CardTitle>{section.title}</CardTitle>
                    {section.description ? (
                      <CardDescription>{section.description}</CardDescription>
                    ) : null}
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">
                      Content for this section will be added soon.
                    </p>
                  </CardContent>
                </Card>
              </section>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
