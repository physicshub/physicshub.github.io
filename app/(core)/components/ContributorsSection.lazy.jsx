// app/components/ContributorsSection.lazy.tsx
import React from "react";

// Lazy import con ritardo artificiale (es. 3 secondi)
const ContributorsSection = React.lazy(
  () =>
    new Promise((resolve) => {
      setTimeout(() => {
        resolve(import("./ContributorsSection"));
      }, 3000); // 3000ms = 3 secondi di delay
    })
);

export default ContributorsSection;
