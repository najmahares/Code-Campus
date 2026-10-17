export function wrapSelection(
  textarea: HTMLTextAreaElement,
  before: string,
  after: string = before
) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const value = textarea.value;
  const selected = value.substring(start, end);
  const replacement = `${before}${selected || 'text'}${after}`;

  const newValue = value.substring(0, start) + replacement + value.substring(end);
  const newCursorPos = selected
    ? start + replacement.length
    : start + before.length;

  return {
    value: newValue,
    cursor: newCursorPos,
    selectionEnd: selected ? start + replacement.length : start + before.length + 4,
  };
}

export function insertAtLineStart(
  textarea: HTMLTextAreaElement,
  prefix: string
) {
  const start = textarea.selectionStart;
  const value = textarea.value;

  // Find start of current line
  let lineStart = value.lastIndexOf('\n', start - 1) + 1;
  const newValue = value.substring(0, lineStart) + prefix + value.substring(lineStart);

  return {
    value: newValue,
    cursor: start + prefix.length,
  };
}
