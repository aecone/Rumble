
// Always turn input into a clean array
export const normalizeToArray = (value: any): string[] => {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') return value.split(',').map(v => v.trim()).filter(Boolean);
    return [];
  };
  
  // Toggle a value inside an array safely
  export const toggleValueInArray = (array: any, value: string): string[] => {
    const arr = normalizeToArray(array);
    return arr.includes(value)
      ? arr.filter(v => v !== value)
      : [...arr, value];
  };
  