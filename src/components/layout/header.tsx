import Link from "next/link";

export function Header() {
  return (
    <header className="border-b">
      <div className="mx-auto flex h-14 max-w-5xl items-center px-4">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          SkillProof
        </Link>
      </div>
    </header>
  );
}
