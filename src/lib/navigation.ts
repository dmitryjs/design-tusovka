export type NavItem = {
  href: string;
  label: string;
};

export type MobileTabId = "materials" | "tasks" | "library" | "profile";

export type MobileTabItem = NavItem & {
  id: MobileTabId;
};

/** Desktop top nav */
export const MAIN_NAV: NavItem[] = [
  { href: "/", label: "Материалы" },
  { href: "/tasks", label: "Задания" },
  { href: "/profile/library", label: "Библиотека" },
  { href: "/profile", label: "Профиль" },
];

/** Mobile bottom tab bar */
export const MOBILE_TAB_NAV: MobileTabItem[] = [
  { id: "materials", href: "/", label: "Материалы" },
  { id: "tasks", href: "/tasks", label: "Задания" },
  { id: "library", href: "/profile/library", label: "Библиотека" },
  { id: "profile", href: "/profile", label: "Профиль" },
];

export function isMaterialReadPage(pathname: string): boolean {
  return /^\/materials\/[^/]+\/read\/?$/.test(pathname);
}

export function isNavItemActive(href: string, pathname: string): boolean {
  if (href === "/") {
    return (
      pathname === "/" ||
      pathname === "/catalog" ||
      pathname.startsWith("/materials/") ||
      pathname.startsWith("/sections/")
    );
  }

  if (href === "/tasks") {
    return pathname === "/tasks" || pathname.startsWith("/tasks/");
  }

  if (href === "/profile/library") {
    return pathname === "/profile/library" || pathname.startsWith("/profile/library/");
  }

  if (href === "/profile") {
    return (
      pathname === "/profile" ||
      (pathname.startsWith("/profile/") && !pathname.startsWith("/profile/library"))
    );
  }

  if (href === "/cart") {
    return pathname === "/cart";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}
