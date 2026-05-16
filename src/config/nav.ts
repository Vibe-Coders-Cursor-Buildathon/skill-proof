export type NavLink = {
  href: string;
  label: string;
  /** Home: active on `/` with no hash. hash: active when hash matches. path: pathname match */
  active: "home" | "hash" | "path";
  hash?: string;
};

export const MAIN_NAV_LINKS: NavLink[] = [
  { href: "/", label: "Home", active: "home" },
  { href: "/courses", label: "Courses", active: "path" },
  { href: "/pricing", label: "Pricing", active: "path" },
  { href: "/about", label: "About", active: "path" },
  { href: "/contact", label: "Contact", active: "path" },
];
