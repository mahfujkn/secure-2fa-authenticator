import jsQR from 'jsqr';

/**
 * Self-Contained Content Script for Local Browser QR Code Capture
 * 100% Local: No remote servers, no cloud OCR, no network requests.
 */

// Decodes an HTMLCanvasElement
function decodeCanvas(canvas: HTMLCanvasElement): string | null {
  try {
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return null;
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imgData.data, imgData.width, imgData.height, {
      inversionAttempts: 'attemptBoth',
    });
    return code && code.data ? code.data : null;
  } catch {
    return null;
  }
}

// Decodes an Image element from the DOM
async function decodeImageElement(img: HTMLImageElement): Promise<string | null> {
  const width = img.naturalWidth || img.width || img.clientWidth;
  const height = img.naturalHeight || img.height || img.clientHeight;
  if (!width || !height) return null;

  // Try direct canvas draw
  try {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (ctx) {
      ctx.drawImage(img, 0, 0, width, height);
      const res = decodeCanvas(canvas);
      if (res) return res;
    }
  } catch {
    // Direct draw might throw if cross-origin; try clean offscreen load below
  }

  // Offscreen load with Anonymous CORS
  return new Promise((resolve) => {
    const clone = new Image();
    clone.crossOrigin = 'Anonymous';
    clone.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = clone.naturalWidth || width;
        canvas.height = clone.naturalHeight || height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return resolve(null);
        ctx.drawImage(clone, 0, 0, canvas.width, canvas.height);
        resolve(decodeCanvas(canvas));
      } catch {
        resolve(null);
      }
    };
    clone.onerror = () => resolve(null);
    clone.src = img.currentSrc || img.src;
  });
}

// Decodes an image from any URL string
async function decodeImageUrl(url: string): Promise<string | null> {
  // First, check if there is an existing <img> in the DOM with this src
  const matchingImgs = Array.from(document.querySelectorAll('img')).filter(
    (img) => img.src === url || img.currentSrc === url
  );
  for (const img of matchingImgs) {
    const res = await decodeImageElement(img);
    if (res) return res;
  }

  // Otherwise load offscreen
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || 300;
        canvas.height = img.naturalHeight || 300;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return resolve(null);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(decodeCanvas(canvas));
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

// Decodes SVG element
async function decodeSvgElement(svg: SVGSVGElement): Promise<string | null> {
  return new Promise((resolve) => {
    try {
      const xml = new XMLSerializer().serializeToString(svg);
      const svg64 = btoa(unescape(encodeURIComponent(xml)));
      const image64 = `data:image/svg+xml;base64,${svg64}`;

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = svg.clientWidth || svg.getBoundingClientRect().width || 300;
        canvas.height = svg.clientHeight || svg.getBoundingClientRect().height || 300;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return resolve(null);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(decodeCanvas(canvas));
      };
      img.onerror = () => resolve(null);
      img.src = image64;
    } catch {
      resolve(null);
    }
  });
}

// Full page scanner
async function scanPageForQrCodes(): Promise<string[]> {
  const detectedTexts: Set<string> = new Set();

  // 1. Scan <img> elements
  const images = Array.from(document.querySelectorAll('img'));
  for (const img of images) {
    const width = img.naturalWidth || img.clientWidth || img.getBoundingClientRect().width;
    const height = img.naturalHeight || img.clientHeight || img.getBoundingClientRect().height;
    if (width >= 24 && height >= 24) {
      const text = await decodeImageElement(img);
      if (text) {
        detectedTexts.add(text);
      }
    }
  }

  // 2. Scan <canvas> elements
  const canvases = Array.from(document.querySelectorAll('canvas'));
  for (const canvas of canvases) {
    if (canvas.width >= 24 && canvas.height >= 24) {
      const text = decodeCanvas(canvas);
      if (text) {
        detectedTexts.add(text);
      }
    }
  }

  // 3. Scan <svg> elements
  const svgs = Array.from(document.querySelectorAll('svg'));
  for (const svg of svgs) {
    const rect = svg.getBoundingClientRect();
    if (rect.width >= 24 && rect.height >= 24) {
      const text = await decodeSvgElement(svg);
      if (text) {
        detectedTexts.add(text);
      }
    }
  }

  // 4. Scan CSS background-image
  const allElements = Array.from(document.querySelectorAll('*'));
  for (const el of allElements) {
    const inlineBg = (el as HTMLElement).style?.backgroundImage;
    if (inlineBg && inlineBg.includes('url(')) {
      const match = inlineBg.match(/url\(["']?([^"')]+)["']?\)/);
      if (match && match[1]) {
        const text = await decodeImageUrl(match[1]);
        if (text) detectedTexts.add(text);
      }
    }
  }

  return Array.from(detectedTexts);
}

// Interactive Area Selection Overlay
function startAreaSelection(): Promise<string | null> {
  return new Promise((resolve) => {
    const existing = document.getElementById('secure-totp-select-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'secure-totp-select-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.zIndex = '2147483647';
    overlay.style.cursor = 'crosshair';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.45)';
    overlay.style.userSelect = 'none';

    // Instruction banner
    const banner = document.createElement('div');
    banner.style.position = 'fixed';
    banner.style.top = '24px';
    banner.style.left = '50%';
    banner.style.transform = 'translateX(-50%)';
    banner.style.backgroundColor = '#0E1524';
    banner.style.color = '#F3F6FC';
    banner.style.padding = '10px 24px';
    banner.style.borderRadius = '9999px';
    banner.style.fontSize = '14px';
    banner.style.fontWeight = '600';
    banner.style.boxShadow = '0 8px 24px rgba(0,0,0,0.5)';
    banner.style.border = '1px solid #3B82F6';
    banner.style.zIndex = '2147483647';
    banner.style.pointerEvents = 'none';
    banner.innerText = 'Drag around the QR code • Press Esc to cancel';
    overlay.appendChild(banner);

    // Selection box
    const selectionBox = document.createElement('div');
    selectionBox.style.position = 'fixed';
    selectionBox.style.border = '2px solid #3B82F6';
    selectionBox.style.backgroundColor = 'rgba(59, 130, 246, 0.2)';
    selectionBox.style.display = 'none';
    selectionBox.style.pointerEvents = 'none';
    selectionBox.style.borderRadius = '4px';
    overlay.appendChild(selectionBox);

    let startX = 0;
    let startY = 0;
    let isDragging = false;

    const cleanup = () => {
      window.removeEventListener('keydown', onKeyDown);
      overlay.remove();
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        cleanup();
        resolve(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);

    overlay.addEventListener('mousedown', (e) => {
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      selectionBox.style.left = `${startX}px`;
      selectionBox.style.top = `${startY}px`;
      selectionBox.style.width = '0px';
      selectionBox.style.height = '0px';
      selectionBox.style.display = 'block';
    });

    overlay.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const currentX = e.clientX;
      const currentY = e.clientY;
      const x = Math.min(startX, currentX);
      const y = Math.min(startY, currentY);
      const width = Math.abs(currentX - startX);
      const height = Math.abs(currentY - startY);

      selectionBox.style.left = `${x}px`;
      selectionBox.style.top = `${y}px`;
      selectionBox.style.width = `${width}px`;
      selectionBox.style.height = `${height}px`;
    });

    overlay.addEventListener('mouseup', async (e) => {
      if (!isDragging) return;
      isDragging = false;

      const currentX = e.clientX;
      const currentY = e.clientY;
      const rectX = Math.min(startX, currentX);
      const rectY = Math.min(startY, currentY);
      const rectW = Math.abs(currentX - startX);
      const rectH = Math.abs(currentY - startY);

      cleanup();

      if (rectW < 15 || rectH < 15) {
        return resolve(null);
      }

      // Check all elements overlapping the bounding rectangle
      const candidates: Element[] = [];
      const images = Array.from(document.querySelectorAll('img, canvas, svg'));
      for (const el of images) {
        const bbox = el.getBoundingClientRect();
        if (
          bbox.left < rectX + rectW &&
          bbox.right > rectX &&
          bbox.top < rectY + rectH &&
          bbox.bottom > rectY
        ) {
          candidates.push(el);
        }
      }

      for (const el of candidates) {
        if (el instanceof HTMLImageElement) {
          const text = await decodeImageElement(el);
          if (text) {
            notifyBackground(text);
            return resolve(text);
          }
        }
        if (el instanceof HTMLCanvasElement) {
          const text = decodeCanvas(el);
          if (text) {
            notifyBackground(text);
            return resolve(text);
          }
        }
        if (el instanceof SVGSVGElement) {
          const text = await decodeSvgElement(el);
          if (text) {
            notifyBackground(text);
            return resolve(text);
          }
        }
      }

      // Fallback: Scan full page
      const allTexts = await scanPageForQrCodes();
      if (allTexts.length > 0) {
        notifyBackground(allTexts[0]);
        return resolve(allTexts[0]);
      }

      resolve(null);
    });

    document.body.appendChild(overlay);
  });
}

function notifyBackground(otpUri: string) {
  try {
    if (chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage({ type: 'QR_SCANNED_SUCCESS', otpUri });
    }
  } catch {
    // Ignore
  }
}

// Runtime message listener
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.type === 'PING') {
    sendResponse({ pong: true });
    return true;
  }

  if (request.type === 'DECODE_QR_IMAGE' && request.srcUrl) {
    decodeImageUrl(request.srcUrl)
      .then((text) => {
        if (text && text.toLowerCase().startsWith('otpauth://')) {
          sendResponse({ otpUri: text });
        } else {
          sendResponse({ error: 'No valid TOTP QR code found in this image.' });
        }
      })
      .catch(() => {
        sendResponse({ error: 'Failed to read image.' });
      });
    return true;
  }

  if (request.type === 'SCAN_PAGE_QR') {
    scanPageForQrCodes()
      .then((results) => {
        sendResponse({ rawResults: results });
      })
      .catch((err) => {
        sendResponse({ error: err instanceof Error ? err.message : 'Page scan failed' });
      });
    return true;
  }

  if (request.type === 'SELECT_QR_AREA') {
    startAreaSelection()
      .then((result) => {
        if (result) {
          sendResponse({ otpUri: result });
        } else {
          sendResponse({ canceled: true });
        }
      })
      .catch((err) => {
        sendResponse({ error: err instanceof Error ? err.message : 'Selection failed' });
      });
    return true;
  }
});
