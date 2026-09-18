"use client";

import { useEffect, useState } from "react";

export interface DocsSection {
  id: string;
  label: string;
}

/** Distance from the top of the viewport at which a section counts as current. */
const ACTIVATION_LINE = 90;

/**
 * Sidebar navigation for the docs page. Highlights whichever section is
 * currently in view, so the sidebar doubles as a position indicator.
 */
export function DocsNav({ sections }: { sections: DocsSection[] }) {
  const [active, setActive] = useState(sections[0]?.id ?? "");

  useEffect(() => {
    const update = () => {
      const atBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      if (atBottom) {
        // The last sections never reach the activation line, so at the end of
        // the page the final entry wins outright.
        setActive(sections[sections.length - 1].id);
        return;
      }

      let current = sections[0]?.id ?? "";
      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (!element) continue;
        if (element.getBoundingClientRect().top <= ACTIVATION_LINE) current = section.id;
        else break;
      }
      setActive(current);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [sections]);

  return (
    <nav className="docs-nav" aria-label="Contents">
      <span className="docs-nav-title">On this page</span>
      <ul>
        {sections.map((section) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              className={section.id === active ? "is-active" : undefined}
              aria-current={section.id === active ? "true" : undefined}
            >
              {section.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
