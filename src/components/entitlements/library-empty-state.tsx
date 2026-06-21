type LibraryEmptyStateProps = {
  title: string;
  description: string;
};

export function LibraryEmptyState({ title, description }: LibraryEmptyStateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-16 text-center">
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-neutral-600">{description}</p>
    </div>
  );
}
