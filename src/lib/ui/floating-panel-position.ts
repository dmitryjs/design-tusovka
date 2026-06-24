const GAP = 8;
const VIEWPORT_PADDING = 12;
const PREFERRED_MAX_LIST_HEIGHT = 320;
const MIN_LIST_HEIGHT = 120;

export type FloatingPanelPlacement = "above" | "below";

export type FloatingPanelCoords = {
  top: number;
  left: number;
  listMaxHeight: number;
  placement: FloatingPanelPlacement;
};

type ComputeFloatingPanelCoordsOptions = {
  anchorRect: DOMRect;
  panelWidth: number;
  chromeHeight: number;
};

export function computeFloatingPanelCoords({
  anchorRect,
  panelWidth,
  chromeHeight,
}: ComputeFloatingPanelCoordsOptions): FloatingPanelCoords {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  const left = Math.min(
    Math.max(VIEWPORT_PADDING, anchorRect.left),
    viewportWidth - panelWidth - VIEWPORT_PADDING,
  );

  const spaceBelow = viewportHeight - anchorRect.bottom - GAP - VIEWPORT_PADDING;
  const spaceAbove = anchorRect.top - GAP - VIEWPORT_PADDING;

  const placement: FloatingPanelPlacement =
    spaceBelow >= PREFERRED_MAX_LIST_HEIGHT || spaceBelow >= spaceAbove
      ? "below"
      : "above";

  const available = placement === "below" ? spaceBelow : spaceAbove;
  const listMaxHeight = Math.max(
    MIN_LIST_HEIGHT,
    Math.min(PREFERRED_MAX_LIST_HEIGHT, available),
  );

  const panelHeight = listMaxHeight + chromeHeight;

  let top: number;
  if (placement === "below") {
    top = anchorRect.bottom + GAP;
    if (top + panelHeight > viewportHeight - VIEWPORT_PADDING) {
      top = Math.max(VIEWPORT_PADDING, viewportHeight - VIEWPORT_PADDING - panelHeight);
    }
  } else {
    top = anchorRect.top - GAP - panelHeight;
    if (top < VIEWPORT_PADDING) {
      top = VIEWPORT_PADDING;
    }
  }

  return { top, left, listMaxHeight, placement };
}
