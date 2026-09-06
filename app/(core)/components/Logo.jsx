import Link from "next/link";
import Image from "next/image";

export function Logo() {
  return (
    <Link href="/" className="logo" aria-label="Home">
      {/* Icon.png is 908×382 — keep width/height on that ratio so the
          responsive `.logo img { height: clamp(...); width: auto }` scales it
          without tripping Next.js's aspect-ratio warning. */}
      <Image
        src="/Icon.png"
        alt="PhysicsHub Logo"
        draggable={false}
        title="PhysicsHub"
        width={114}
        height={48}
        priority
      />
    </Link>
  );
}
