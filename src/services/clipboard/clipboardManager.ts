/**
 * Safe Local Clipboard Manager
 * Strips whitespace formatting before copying to clipboard (e.g. "482 913" -> "482913").
 * Optionally schedules a safe in-memory auto-clear if configured.
 */

let activeClearTimeout: number | null = null;

export async function copyToClipboard(text: string, autoClearSeconds: number = 0): Promise<boolean> {
  const cleanDigits = text.replace(/\s+/g, '');

  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(cleanDigits);
    } else {
      // Fallback for older/restricted contexts
      const textArea = document.createElement('textarea');
      textArea.value = cleanDigits;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }

    if (activeClearTimeout !== null) {
      window.clearTimeout(activeClearTimeout);
      activeClearTimeout = null;
    }

    if (autoClearSeconds > 0) {
      activeClearTimeout = window.setTimeout(async () => {
        try {
          // Attempt to clear if document is still active
          if (document.hasFocus() && navigator?.clipboard?.writeText) {
            await navigator.clipboard.writeText('');
          }
        } catch {
          // Ignore auto-clear failure
        }
      }, autoClearSeconds * 1000);
    }

    return true;
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
    return false;
  }
}
