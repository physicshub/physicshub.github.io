import { useEffect, useState } from "react";

export default function FunFactSlider({ chapterName, fact }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!fact) return;
    setOpen(true);

    const timer = setTimeout(() => setOpen(false), 4500);
    return () => clearTimeout(timer);
  }, [fact]);

  if (!fact) return null;

  return (
    <div
      className={`
        absolute top-1/2 right-0 -translate-y-1/2
        w-[320px] max-w-[90%]
        transition-transform duration-500 ease-out
        ${open ? "translate-x-0" : "translate-x-full"}
      `}
    >
      <div className="bg-base-200 border border-cyan-400
                      shadow-xl rounded-l-xl p-4">
        <div className="flex gap-2">
          <span className="text-xl">💡</span>
          <div>
            <p className="text-sm font-semibold">
              {chapterName}
            </p>
            <p className="text-sm opacity-90">
              {fact}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
