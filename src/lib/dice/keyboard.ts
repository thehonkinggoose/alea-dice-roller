export function isTypingTarget(target: EventTarget | null): boolean {
  if (typeof HTMLElement === "undefined") return false;
  if (!(target instanceof HTMLElement)) return false;
  if (target.closest("input, textarea, select, [contenteditable='true']")) return true;
  if (
    target.closest(
      "a, [href], button, [role='button'], [role='switch'], [role='slider'], [role='link'], [role='radio'], [role='tab'], [role='menuitem'], [role='option'], [role='combobox'], [role='spinbutton'], summary, details, [role='region'], table, [role='table'], [role='grid']",
    )
  ) {
    return true;
  }
  return false;
}

export function onRadioGroupKeyDown(event: { key: string; preventDefault: () => void; currentTarget: EventTarget | null }) {
  if (
    event.key !== "ArrowRight" &&
    event.key !== "ArrowDown" &&
    event.key !== "ArrowLeft" &&
    event.key !== "ArrowUp" &&
    event.key !== "Home" &&
    event.key !== "End"
  ) {
    return;
  }
  const current = event.currentTarget;
  if (!(current instanceof HTMLElement)) return;
  const group = current.closest("[role='radiogroup']");
  if (!group) return;
  const radios = [...group.querySelectorAll<HTMLElement>("[role='radio']:not(:disabled)")];
  if (radios.length === 0) return;
  const i = radios.indexOf(current);
  const index = i < 0 ? 0 : i;
  event.preventDefault();
  let next = index;
  if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (index + 1) % radios.length;
  else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (index - 1 + radios.length) % radios.length;
  else if (event.key === "Home") next = 0;
  else if (event.key === "End") next = radios.length - 1;
  const target = radios[next];
  if (!target) return;
  target.focus();
  target.click();
}
