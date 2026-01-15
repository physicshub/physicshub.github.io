import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="logo" aria-label="Home">
      <img
        src={"/Icon.png"}
        alt="PhysicsHub Logo"
        draggable={false}
        title="PhysicsHub"
        className="object-cover"
      />
    </Link>
  );
}
