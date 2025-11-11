export default function getBackgroundColor(): number[] | null {
  const bodyBg = getComputedStyle(document.body).backgroundColor;
  const matches = bodyBg.match(/\d+/g);

  if (!matches) {
    return null;
  }

  return matches.map(Number);
}
