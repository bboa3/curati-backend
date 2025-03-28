import * as Crypto from 'crypto';

export async function generateHashedIdentifier(data: string, prefix?: string): Promise<string> {
  const hash = Crypto
    .createHash('sha256')
    .update(data, 'utf8')
    .digest('hex');

  return `${prefix || 'CUR'}-${hash.substring(0, 10)}`;
}

