import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  BookOpen,
  Briefcase,
  CircleUserRound,
  FileBarChart,
  FileText,
  FolderKanban,
  Home,
  LayoutGrid,
  Layers,
  MessageSquare,
  Plug,
  Settings,
  ShieldCheck,
  Star,
  Users,
} from "lucide-react";

export type AdminNavItem = {
  label: string;
  href?: string;
  Icon: LucideIcon;
  disabled?: boolean;
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
        label: "Главная",
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
        href: "/admin/products?kind=material",
        Icon: FileText,
        isActive: (pathname, searchParams) =>
          productsActive(pathname) &&
          (searchParams?.get("kind") === "material" ||
            (!searchParams?.get("kind") && pathname.startsWith("/admin/products/"))),
      },
      {
        label: "Задания",
        href: "/admin/products?kind=task",
        Icon: Briefcase,
        isActive: (pathname, searchParams) =>
          productsActive(pathname) && searchParams?.get("kind") === "task",
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
      {
        label: "Каталог",
        href: "/admin/products",
        Icon: LayoutGrid,
        isActive: (pathname, searchParams) =>
          productsActive(pathname) && !searchParams?.get("kind"),
      },
    ],
  },
  {
    title: "Пользователи",
    items: [
      { label: "Пользователи", Icon: Users, disabled: true },
      { label: "Подписки", Icon: ShieldCheck, disabled: true },
      { label: "Отзывы", Icon: Star, disabled: true },
      { label: "Комментарии", Icon: MessageSquare, disabled: true },
    ],
  },
  {
    title: "Аналитика",
    items: [
      { label: "Статистика", Icon: BarChart3, disabled: true },
      { label: "События", Icon: CircleUserRound, disabled: true },
      { label: "Отчёты", Icon: FileBarChart, disabled: true },
    ],
  },
  {
    title: "Настройки",
    items: [
      { label: "Главная сайта", Icon: FolderKanban, disabled: true },
      { label: "Профиль", href: "/profile", Icon: CircleUserRound },
      { label: "Настройки сайта", Icon: Settings, disabled: true },
      { label: "Интеграции", Icon: Plug, disabled: true },
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

  if (!item.href || item.disabled) {
    return false;
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
