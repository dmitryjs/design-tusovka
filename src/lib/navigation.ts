export type NavItem = {
  href: string;
  label: string;
};

export const MAIN_NAV: NavItem[] = [
  { href: "/", label: "Главная" },
  { href: "/catalog", label: "Каталог" },
  { href: "/tasks", label: "Задания" },
  { href: "/profile", label: "Моя библиотека" },
];

export function isNavItemActive(href: string, pathname: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }

  if (href === "/catalog") {
    return (
      pathname === "/catalog" ||
      pathname.startsWith("/materials/") ||
      pathname.startsWith("/sections/")
    );
  }

  if (href === "/tasks") {
    return pathname === "/tasks" || pathname.startsWith("/tasks/");
  }

  if (href === "/profile") {
    return pathname === "/profile" || pathname.startsWith("/profile/");
  }

  if (href === "/cart") {
    return pathname === "/cart";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}
