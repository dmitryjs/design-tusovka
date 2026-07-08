"use client";

import { useState } from "react";

import { MaterialMeta } from "@/components/catalog/material/material-meta";
import { MaterialTableOfContents } from "@/components/catalog/material/material-table-of-contents";
import type { MaterialDetail } from "@/lib/catalog/detail-queries";
import { cn } from "@/lib/utils";

type MaterialInfoTab = "about" | "contents";

type MaterialInfoTabsProps = {
  material: MaterialDetail;
  className?: string;
};

export function MaterialInfoTabs({ material, className }: MaterialInfoTabsProps) {
  const [activeTab, setActiveTab] = useState<MaterialInfoTab>("about");

  return (
    <section className={cn("w-full", className)} aria-label="Информация о материале">
      <div
        role="tablist"
        aria-label="Разделы информации"
        className="flex border-b border-neutral-200"
      >
        {(
          [
            { id: "about", label: "О материале" },
            { id: "contents", label: "Содержание" },
          ] as const
        ).map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`material-tab-${tab.id}`}
              aria-selected={isActive}
              aria-controls={`material-panel-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "border-b px-3 py-3 text-sm font-medium transition-colors",
                isActive
                  ? "-mb-px border-neutral-300 text-primary"
                  : "border-transparent text-neutral-500 hover:text-neutral-700",
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id="material-panel-about"
        aria-labelledby="material-tab-about"
        hidden={activeTab !== "about"}
        className="pt-4"
      >
        <MaterialMeta material={material} framed={false} />
      </div>

      <div
        role="tabpanel"
        id="material-panel-contents"
        aria-labelledby="material-tab-contents"
        hidden={activeTab !== "contents"}
        className="pt-4"
      >
        <MaterialTableOfContents
          chapters={material.chapters}
          h1Headings={material.h1Headings}
          isPreview={material.isPreview}
          framed={false}
        />
      </div>
    </section>
  );
}
