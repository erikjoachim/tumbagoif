export interface HighlightSegment {
  text: string;
  highlighted?: boolean;
}

export function parseHighlight(input: string): HighlightSegment[] {
  const parts: HighlightSegment[] = [];
  const re = /<mark>(.*?)<\/mark>/g;
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = re.exec(input)) !== null) {
    if (match.index > last) {
      parts.push({ text: input.slice(last, match.index) });
    }
    parts.push({ text: match[1], highlighted: true });
    last = re.lastIndex;
  }
  if (last < input.length) {
    parts.push({ text: input.slice(last) });
  }
  return parts;
}
