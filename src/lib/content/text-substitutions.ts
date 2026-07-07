/** Заменяет `--` на em dash (—) в текстовых узлах contenteditable. */
export function replaceDoubleDashInEditable(root: HTMLElement): boolean {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let changed = false;

  let node = walker.nextNode();

  while (node) {
    const textNode = node as Text;

    if (textNode.data.includes("--")) {
      textNode.data = textNode.data.replace(/--/g, "—");
      changed = true;
    }

    node = walker.nextNode();
  }

  return changed;
}

/** Заменяет `--` на em dash в plain text или HTML без тегов. */
export function substituteEmDashInPlainText(text: string): string {
  return text.replace(/--/g, "—");
}
