import Link from "next/link";
import VaultMark from "./VaultMark";

export default function Footer() {
  return (
    <footer className="border-t border-line bg-ink text-cream/80 print:hidden">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3">
        <div>
          <div className="flex items-center gap-2.5">
            <VaultMark className="h-9 w-9" />
            <p className="font-serif text-2xl font-bold text-cream">
              Recipe Card <span className="text-[#e58a6f]">Vault</span>
            </p>
          </div>
          <p className="mt-3 text-sm">
            A safe place for the recipes that matter — ready to print on a full
            page or a classic index card whenever you need them.
          </p>
        </div>
        <nav className="text-sm">
          <p className="mb-2 text-xs font-bold tracking-[0.14em] text-cream uppercase">
            Recipes
          </p>
          <ul className="space-y-1">
            <li>
              <Link className="hover:text-white" href="/explore">
                Browse the Vault
              </Link>
            </li>
            <li>
              <Link className="hover:text-white" href="/new-recipe">
                Add a recipe
              </Link>
            </li>
          </ul>
        </nav>
        <nav className="text-sm">
          <p className="mb-2 text-xs font-bold tracking-[0.14em] text-cream uppercase">
            Your vault
          </p>
          <ul className="space-y-1">
            <li>
              <Link className="hover:text-white" href="/profile">
                Account
              </Link>
            </li>
            <li>
              <Link className="hover:text-white" href="/signin">
                Sign in
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-cream/50">
        © {new Date().getFullYear()} Recipe Card Vault
      </div>
    </footer>
  );
}
