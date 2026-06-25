import {
  ArrowRight,
  BarChart3,
  Bell,
  BookOpen,
  Bookmark,
  Brain,
  Calendar,
  Check,
  CheckCircle2,
  CircleAlert,
  CircleHelp,
  ClipboardList,
  Clock,
  Code,
  Database,
  Download,
  ExternalLink,
  Eye,
  FileText,
  Flag,
  Gift,
  GraduationCap,
  Heart,
  Home,
  Info,
  Key,
  Lightbulb,
  Link2,
  Lock,
  Mail,
  MapPin,
  MessageCircle,
  Minus,
  Palette,
  PenTool,
  Pencil,
  PieChart,
  Plus,
  Rocket,
  Search,
  Settings,
  Shield,
  Smile,
  Sparkles,
  Star,
  Target,
  Terminal,
  ThumbsDown,
  ThumbsUp,
  TrendingUp,
  TriangleAlert,
  Trophy,
  Unlock,
  Upload,
  User,
  Users,
  Wrench,
  X,
  XCircle,
  Zap,
  type LucideIcon,
} from "lucide-react";

export type CalloutIconId =
  | "info"
  | "circle-help"
  | "lightbulb"
  | "sparkles"
  | "star"
  | "bookmark"
  | "flag"
  | "zap"
  | "target"
  | "trending-up"
  | "bar-chart"
  | "pie-chart"
  | "users"
  | "user"
  | "heart"
  | "thumbs-up"
  | "thumbs-down"
  | "message-circle"
  | "mail"
  | "bell"
  | "calendar"
  | "clock"
  | "file-text"
  | "book-open"
  | "graduation-cap"
  | "pen-tool"
  | "palette"
  | "code"
  | "terminal"
  | "database"
  | "settings"
  | "wrench"
  | "shield"
  | "lock"
  | "unlock"
  | "key"
  | "eye"
  | "arrow-right"
  | "link"
  | "external-link"
  | "download"
  | "upload"
  | "check-circle"
  | "circle-alert"
  | "triangle-alert"
  | "x-circle"
  | "check"
  | "x"
  | "plus"
  | "minus"
  | "smile"
  | "map-pin"
  | "home"
  | "search"
  | "gift"
  | "trophy"
  | "rocket"
  | "brain"
  | "pencil"
  | "clipboard-list";

export type CalloutIconOption = {
  id: CalloutIconId;
  label: string;
  keywords: string[];
};

export const CALLOUT_ICON_OPTIONS: CalloutIconOption[] = [
  { id: "info", label: "Информация", keywords: ["info", "i"] },
  { id: "circle-help", label: "Вопрос", keywords: ["help", "?"] },
  { id: "lightbulb", label: "Идея", keywords: ["bulb", "лампочка"] },
  { id: "sparkles", label: "Вдохновение", keywords: ["sparkle", "звёзды"] },
  { id: "star", label: "Важное", keywords: ["star", "звезда"] },
  { id: "bookmark", label: "Закладка", keywords: ["bookmark"] },
  { id: "flag", label: "Флаг", keywords: ["flag"] },
  { id: "zap", label: "Энергия", keywords: ["zap", "молния"] },
  { id: "target", label: "Цель", keywords: ["target", "мишень"] },
  { id: "trending-up", label: "Рост", keywords: ["trend", "график"] },
  { id: "bar-chart", label: "Аналитика", keywords: ["chart", "столбцы"] },
  { id: "pie-chart", label: "Диаграмма", keywords: ["pie", "круг"] },
  { id: "users", label: "Команда", keywords: ["users", "люди"] },
  { id: "user", label: "Пользователь", keywords: ["user", "человек"] },
  { id: "heart", label: "Сердце", keywords: ["heart", "любовь"] },
  { id: "thumbs-up", label: "Нравится", keywords: ["like", "палец"] },
  { id: "thumbs-down", label: "Не нравится", keywords: ["dislike"] },
  { id: "message-circle", label: "Сообщение", keywords: ["message", "чат"] },
  { id: "mail", label: "Почта", keywords: ["mail", "email"] },
  { id: "bell", label: "Уведомление", keywords: ["bell", "колокол"] },
  { id: "calendar", label: "Календарь", keywords: ["calendar", "дата"] },
  { id: "clock", label: "Время", keywords: ["clock", "часы"] },
  { id: "file-text", label: "Документ", keywords: ["file", "файл"] },
  { id: "book-open", label: "Книга", keywords: ["book", "чтение"] },
  { id: "graduation-cap", label: "Обучение", keywords: ["education", "учёба"] },
  { id: "pen-tool", label: "Дизайн", keywords: ["pen", "вектор"] },
  { id: "palette", label: "Палитра", keywords: ["palette", "цвета"] },
  { id: "code", label: "Код", keywords: ["code", "разработка"] },
  { id: "terminal", label: "Терминал", keywords: ["terminal", "консоль"] },
  { id: "database", label: "Данные", keywords: ["database", "база"] },
  { id: "settings", label: "Настройки", keywords: ["settings", "шестерёнка"] },
  { id: "wrench", label: "Инструмент", keywords: ["wrench", "ключ"] },
  { id: "shield", label: "Защита", keywords: ["shield", "щит"] },
  { id: "lock", label: "Блокировка", keywords: ["lock", "замок"] },
  { id: "unlock", label: "Разблокировка", keywords: ["unlock"] },
  { id: "key", label: "Ключ", keywords: ["key"] },
  { id: "eye", label: "Просмотр", keywords: ["eye", "глаз"] },
  { id: "arrow-right", label: "Стрелка", keywords: ["arrow", "вперёд"] },
  { id: "link", label: "Ссылка", keywords: ["link"] },
  { id: "external-link", label: "Внешняя ссылка", keywords: ["external"] },
  { id: "download", label: "Скачать", keywords: ["download"] },
  { id: "upload", label: "Загрузить", keywords: ["upload"] },
  { id: "check-circle", label: "Успех", keywords: ["success", "готово"] },
  { id: "circle-alert", label: "Внимание", keywords: ["alert"] },
  { id: "triangle-alert", label: "Предупреждение", keywords: ["warning"] },
  { id: "x-circle", label: "Ошибка", keywords: ["error", "отмена"] },
  { id: "check", label: "Галочка", keywords: ["check"] },
  { id: "x", label: "Крестик", keywords: ["close", "x"] },
  { id: "plus", label: "Плюс", keywords: ["plus", "добавить"] },
  { id: "minus", label: "Минус", keywords: ["minus"] },
  { id: "smile", label: "Улыбка", keywords: ["smile", "эмоция"] },
  { id: "map-pin", label: "Место", keywords: ["pin", "локация"] },
  { id: "home", label: "Дом", keywords: ["home"] },
  { id: "search", label: "Поиск", keywords: ["search"] },
  { id: "gift", label: "Подарок", keywords: ["gift"] },
  { id: "trophy", label: "Награда", keywords: ["trophy", "кубок"] },
  { id: "rocket", label: "Запуск", keywords: ["rocket", "ракета"] },
  { id: "brain", label: "Мышление", keywords: ["brain", "мозг"] },
  { id: "pencil", label: "Редактирование", keywords: ["pencil", "карандаш"] },
  { id: "clipboard-list", label: "Список", keywords: ["clipboard", "чеклист"] },
];

export const CALLOUT_ICONS: Record<CalloutIconId, LucideIcon> = {
  info: Info,
  "circle-help": CircleHelp,
  lightbulb: Lightbulb,
  sparkles: Sparkles,
  star: Star,
  bookmark: Bookmark,
  flag: Flag,
  zap: Zap,
  target: Target,
  "trending-up": TrendingUp,
  "bar-chart": BarChart3,
  "pie-chart": PieChart,
  users: Users,
  user: User,
  heart: Heart,
  "thumbs-up": ThumbsUp,
  "thumbs-down": ThumbsDown,
  "message-circle": MessageCircle,
  mail: Mail,
  bell: Bell,
  calendar: Calendar,
  clock: Clock,
  "file-text": FileText,
  "book-open": BookOpen,
  "graduation-cap": GraduationCap,
  "pen-tool": PenTool,
  palette: Palette,
  code: Code,
  terminal: Terminal,
  database: Database,
  settings: Settings,
  wrench: Wrench,
  shield: Shield,
  lock: Lock,
  unlock: Unlock,
  key: Key,
  eye: Eye,
  "arrow-right": ArrowRight,
  link: Link2,
  "external-link": ExternalLink,
  download: Download,
  upload: Upload,
  "check-circle": CheckCircle2,
  "circle-alert": CircleAlert,
  "triangle-alert": TriangleAlert,
  "x-circle": XCircle,
  check: Check,
  x: X,
  plus: Plus,
  minus: Minus,
  smile: Smile,
  "map-pin": MapPin,
  home: Home,
  search: Search,
  gift: Gift,
  trophy: Trophy,
  rocket: Rocket,
  brain: Brain,
  pencil: Pencil,
  "clipboard-list": ClipboardList,
};

export function isCalloutIconId(value: string): value is CalloutIconId {
  return value in CALLOUT_ICONS;
}

export function resolveCalloutIcon(value: string | null | undefined): LucideIcon | null {
  if (!value || !isCalloutIconId(value)) {
    return null;
  }

  return CALLOUT_ICONS[value];
}

export function filterCalloutIconOptions(query: string): CalloutIconOption[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return CALLOUT_ICON_OPTIONS;
  }

  return CALLOUT_ICON_OPTIONS.filter((option) => {
    if (option.label.toLowerCase().includes(normalized)) {
      return true;
    }

    if (option.id.includes(normalized)) {
      return true;
    }

    return option.keywords.some((keyword) => keyword.toLowerCase().includes(normalized));
  });
}
