import jsQR from 'jsqr';
import { parseOtpAuthUri, ParsedOtpAuthUri } from '../parser/otpauth';

export interface QrCandidateItem {
  id: string;
  rawText: string;
  isTotp: boolean;
  parsed?: ParsedOtpAuthUri;
  label: string;
  error?: string;
}

/**
 * Decodes ImageData using jsQR
 */
export function decodeImageData(imageData: ImageData): string | null {
  const code = jsQR(imageData.data, imageData.width, imageData.height, {
    inversionAttempts: 'attemptBoth',
  });
  return code ? code.data : null;
}

/**
 * Analyzes decoded QR text and checks if it contains a valid TOTP URI
 */
export function analyzeQrText(qrText: string): QrCandidateItem {
  const trimmed = qrText.trim();
  const id = `qr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  if (trimmed.toLowerCase().startsWith('otpauth://')) {
    try {
      const parsed = parseOtpAuthUri(trimmed);
      return {
        id,
        rawText: trimmed,
        isTotp: true,
        parsed,
        label: `${parsed.issuer} (${parsed.account})`,
      };
    } catch (err: unknown) {
      return {
        id,
        rawText: trimmed,
        isTotp: false,
        label: 'Unsupported OTP URI',
        error: err instanceof Error ? err.message : 'Invalid OTP URI',
      };
    }
  }

  return {
    id,
    rawText: trimmed,
    isTotp: false,
    label: 'Non-TOTP QR Code',
    error: "This QR code is not a supported TOTP configuration.",
  };
}

/**
 * Reads an image File/Blob, renders onto an offscreen canvas, and decodes QR locally.
 */
export async function decodeQrFromFile(file: File | Blob): Promise<ParsedOtpAuthUri> {
  return new Promise((resolve, reject) => {
    if (file.type && !file.type.startsWith('image/')) {
      return reject(new Error('Selected file is not an image (PNG, JPG, WEBP, or GIF supported).'));
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error("We couldn't read this image file."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to load image for local scanning.'));
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d', { willReadFrequently: true });

          if (!ctx) {
            return reject(new Error('Could not create 2D canvas context.'));
          }

          ctx.drawImage(img, 0, 0, img.width, img.height);
          const imageData = ctx.getImageData(0, 0, img.width, img.height);

          const qrText = decodeImageData(imageData);
          if (!qrText) {
            return reject(new Error("QR code not found."));
          }

          const candidate = analyzeQrText(qrText);
          if (!candidate.isTotp || !candidate.parsed) {
            return reject(new Error(candidate.error || "We found a QR code, but it doesn't contain a supported TOTP configuration."));
          }

          resolve(candidate.parsed);
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Failed to parse TOTP QR code.';
          reject(new Error(msg));
        }
      };
      img.src = reader.result as string;
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Decodes an image from an Image Element or Image URL string (e.g. data URL or blob URL)
 */
export async function decodeQrFromImageUrl(url: string): Promise<ParsedOtpAuthUri> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onerror = () => reject(new Error('Unable to read image for local QR decoding.'));
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        if (!ctx) {
          return reject(new Error('Could not create canvas context.'));
        }

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        const qrText = decodeImageData(imageData);
        if (!qrText) {
          return reject(new Error('QR code not found in this image.'));
        }

        const candidate = analyzeQrText(qrText);
        if (!candidate.isTotp || !candidate.parsed) {
          return reject(new Error(candidate.error || "This QR code is not a supported TOTP configuration."));
        }

        resolve(candidate.parsed);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to decode QR code.';
        reject(new Error(msg));
      }
    };
    img.src = url;
  });
}
