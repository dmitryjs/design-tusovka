export function mapAuthErrorMessage(message: string): string {
  const normalized = message.toLowerCase();

  if (normalized.includes("invalid login credentials")) {
    return "Неверный email или пароль.";
  }

  if (normalized.includes("email not confirmed")) {
    return "Подтвердите email — проверьте почту и перейдите по ссылке из письма.";
  }

  if (normalized.includes("user already registered")) {
    return "Пользователь с таким email уже зарегистрирован.";
  }

  if (normalized.includes("password should be at least")) {
    return "Пароль слишком короткий — минимум 6 символов.";
  }

  if (normalized.includes("unable to validate email address")) {
    return "Некорректный email.";
  }

  if (normalized.includes("signup is disabled")) {
    return "Регистрация отключена в настройках Supabase.";
  }

  if (normalized.includes("rate limit")) {
    return "Слишком много попыток. Подождите немного и попробуйте снова.";
  }

  return message;
}
