"use client";

import Image from "next/image";
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
import { GUIDE_CONTENT } from "@/data/UserGuide/guide-content";

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
  const sections: GuideSection[] = React.useMemo(
    () =>
      GUIDE_CONTENT.map(({ id, title, description }) => ({
        id,
        title,
        description,
      })),
    [],
  );

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
          <UserGuideSidebar sections={sections} onNavigate={scrollToSection} />
        </aside>

        <main className="min-w-0 flex-1 md:ml-72 md:pl-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Afrobeutic User Guide</CardTitle>
                <CardDescription>
                  Use the menu to jump between sections.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  You can share a link to any section using the URL hash (for
                  example: #accounts).
                </p>
              </CardContent>
            </Card>

            {GUIDE_CONTENT.map((section) => (
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
                    <div className="space-y-3">
                      {section.paragraphs.map((paragraph) => (
                        <p
                          key={paragraph}
                          className="text-muted-foreground text-sm"
                        >
                          {paragraph}
                        </p>
                      ))}

                      {section.images?.map((image) => (
                        <figure
                          key={`${section.id}-${image.src}`}
                          className="space-y-2"
                        >
                          <Image
                            src={image.src}
                            alt={image.alt}
                            width={image.width}
                            height={image.height}
                            className="w-full rounded-md border object-cover"
                          />
                          {image.caption ? (
                            <figcaption className="text-muted-foreground text-xs">
                              {image.caption}
                            </figcaption>
                          ) : null}
                        </figure>
                      ))}
                    </div>
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
