import Link from "next/link";
import Image from "next/image";

export function Logo() {
  return (
    <Link href="/" className="logo" aria-label="Home">
      <Image
        src="/Icon.png"
        alt="PhysicsHub Logo"
        draggable={false}
        title="PhysicsHub"
        className="object-cover"
        width={40}
        height={40}
      />
    </Link>
  );
}
