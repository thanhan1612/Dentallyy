interface CodeConfig {
  prefix: string;
  length: number;
  existingCodes: string[];
}

export const generateNextCode = ({ prefix, length, existingCodes }: CodeConfig): string => {
  const maxCode = existingCodes.reduce((max: number, code: string) => {
    const num = parseInt(code?.replace(prefix, '') || '0');
    return num > max ? num : max;
  }, 0);

  return `${prefix}${(maxCode + 1).toString().padStart(length, '0')}`;
}; 