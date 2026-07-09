import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  BookOpen,
  Briefcase,
  FileBarChart,
  FileText,
  Home,
  Layers,
  Star,
  Upload,
  Users,
} from "lucide-react";

export type AdminNavItem = {
  label: string;
  href: string;
  Icon: LucideIcon;
  isActive?: (pathname: string, searchParams?: URLSearchParams) => boolean;
};

export type AdminNavSection = {
  title?: string;
  items: AdminNavItem[];
};

function productsActive(pathname: string): boolean {
  return pathname === "/admin/products" || pathname.startsWith("/admin/products/");
}

export const ADMIN_NAV: AdminNavSection[] = [
  {
    items: [
      {
        label: "Дашборд",
        href: "/admin",
        Icon: Home,
        isActive: (pathname) => pathname === "/admin",
      },
    ],
  },
  {
    title: "Контент",
    items: [
      {
        label: "Материалы",
        href: "/admin/products",
        Icon: FileText,
        isActive: (pathname, searchParams) =>
          productsActive(pathname) && searchParams?.get("kind") !== "task",
      },
      {
        label: "Задания",
        href: "/admin/products?kind=task",
        Icon: Briefcase,
        isActive: (pathname, searchParams) =>
          productsActive(pathname) && searchParams?.get("kind") === "task",
      },
      {
        label: "Импорт заданий",
        href: "/admin/import/tasks",
        Icon: Upload,
        isActive: (pathname) => pathname.startsWith("/admin/import/tasks"),
      },
      {
        label: "Разделы",
        href: "/admin/sections",
        Icon: BookOpen,
        isActive: (pathname) => pathname.startsWith("/admin/sections"),
      },
      {
        label: "Теги",
        href: "/admin/tags",
        Icon: Layers,
        isActive: (pathname) => pathname.startsWith("/admin/tags"),
      },
    ],
  },
  {
    title: "Пользователи",
    items: [
      {
        label: "Пользователи",
        href: "/admin/users",
        Icon: Users,
        isActive: (pathname) => pathname.startsWith("/admin/users"),
      },
      {
        label: "Отзывы",
        href: "/admin/reviews",
        Icon: Star,
        isActive: (pathname) => pathname.startsWith("/admin/reviews"),
      },
    ],
  },
  {
    title: "Аналитика",
    items: [
      {
        label: "Статистика",
        href: "/admin/analytics",
        Icon: BarChart3,
        isActive: (pathname) => pathname.startsWith("/admin/analytics"),
      },
      {
        label: "Отчёты",
        href: "/admin/reports",
        Icon: FileBarChart,
        isActive: (pathname) => pathname.startsWith("/admin/reports"),
      },
    ],
  },
];

export function isAdminNavItemActive(
  item: AdminNavItem,
  pathname: string,
  searchParams?: URLSearchParams,
): boolean {
  if (item.isActive) {
    return item.isActive(pathname, searchParams);
  }

  if (item.href.includes("?")) {
    const [path, query] = item.href.split("?");
    const expected = new URLSearchParams(query);

    if (pathname !== path) {
      return false;
    }

    for (const [key, value] of expected.entries()) {
      if (searchParams?.get(key) !== value) {
        return false;
      }
    }

    return true;
  }

  return pathname === item.href;
}
