import { Algorithm } from '../../types/account';

/**
 * Maps our Algorithm type to Web Crypto SubtleCrypto HMAC hash identifiers
 */
function getWebCryptoAlgorithmName(algorithm: Algorithm): string {
  switch (algorithm) {
    case 'SHA-1':
      return 'SHA-1';
    case 'SHA-256':
      return 'SHA-256';
    case 'SHA-512':
      return 'SHA-512';
    default:
      return 'SHA-1';
  }
}

/**
 * Computes HMAC using the standard Web Crypto API (supported natively in all modern browsers)
 */
export async function computeHmac(
  algorithm: Algorithm,
  keyBytes: Uint8Array,
  messageBytes: Uint8Array
): Promise<Uint8Array> {
  const hashName = getWebCryptoAlgorithmName(algorithm);

  // Web Crypto SubtleCrypto HMAC import
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyBytes as BufferSource,
    {
      name: 'HMAC',
      hash: { name: hashName },
    },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageBytes as BufferSource);
  return new Uint8Array(signature);
}
