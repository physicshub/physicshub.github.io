// components/theory/TheoryRenderer.tsx
import React from "react";
import {
  TheorySection,
  TheoryParagraph,
  TheorySubheading,
  TheoryNote,
  TheoryList,
  TheoryCodeBlock,
  TheoryCallout,
  TheoryFormula,
  TheoryExample,
  TheoryTable,
  TheoryImage,
  TheoryToggle
} from "./Typo";

import { BlockMath, InlineMath } from "react-katex";

export default function TheoryRenderer({ theory }: { theory: any }) {
  if (!theory?.sections?.length) return null;

  return (
    <div className="theory-container">
      {theory.sections.map((sec: any, i: number) => (
        <TheorySection key={i} title={sec.title}>
          {sec.blocks?.map((b: any, j: number) => {
            switch (b.type) {
              case "paragraph":
                return <TheoryParagraph key={j}>{b.text}</TheoryParagraph>;
              case "subheading":
                return <TheorySubheading key={j}>{b.text}</TheorySubheading>;
              case "note":
                return <TheoryNote key={j}>{b.text}</TheoryNote>;
              case "list":
                return <TheoryList key={j} items={b.items || []} ordered={!!b.ordered} />;
              case "formula":
                 return <TheoryFormula key={j} latex={b.latex} inline={b.inline} />;
              case "code":
                return <TheoryCodeBlock key={j} code={b.code || ""} language={b.language || ""} />;
              case "callout":
                return (
                  <TheoryCallout key={j} type={b.calloutType || "info"} title={b.title}>
                    {b.text || b.children}
                  </TheoryCallout>
                );
              case "example":
                return (
                  <TheoryExample key={j} title={b.title}>
                    {b.content || b.children}
                  </TheoryExample>
                );
              case "table":
                return (
                  <TheoryTable
                    key={j}
                    columns={b.columns || []}
                    data={b.data || []}
                  />
                );
              case "image":
                return <TheoryImage key={j} src={b.src} alt={b.alt || ""} caption={b.caption} />;
              case "toggle":
                return (
                  <TheoryToggle key={j} title={b.title || "Details"}>
                    {b.content || b.children}
                  </TheoryToggle>
                );
              default:
                return null;
            }
          })}
        </TheorySection>
      ))}
    </div>
  );
}
