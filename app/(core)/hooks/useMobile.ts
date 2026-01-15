import * as React from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(
    undefined
  );

  React.useEffect(() => {
    // Definiamo la query
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);

    // Funzione di aggiornamento che legge direttamente dalla query
    const onChange = () => {
      setIsMobile(mql.matches);
    };

    // Ascolta i cambiamenti di stato della query
    mql.addEventListener("change", onChange);

    // Stato iniziale
    setIsMobile(mql.matches);

    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isMobile;
}
