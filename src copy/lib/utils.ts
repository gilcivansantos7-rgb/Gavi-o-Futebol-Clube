import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { addDays, startOfMonth, getDay, format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Calculates the second Saturday of a given month and year.
 */
export function getSecondSaturday(month: number, year: number): Date {
  const firstDayOfMonth = startOfMonth(new Date(year, month));
  const firstDayDayOfWeek = getDay(firstDayOfMonth); // 0 (Sun) to 6 (Sat)
  
  // Days to first Saturday: (6 - firstDayDayOfWeek + 7) % 7
  const daysToFirstSaturday = (6 - firstDayDayOfWeek + 7) % 7;
  const firstSaturday = addDays(firstDayOfMonth, daysToFirstSaturday);
  
  // Second Saturday is 7 days after the first
  return addDays(firstSaturday, 7);
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatMonthYear(month: number, year: number) {
  return format(new Date(year, month), 'MMMM yyyy');
}

export function toCamelCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(v => toCamelCase(v));
  } else if (obj !== null && obj !== undefined && obj.constructor === Object) {
    return Object.keys(obj).reduce((result, key) => {
      const camelKey = key.replace(/([-_][a-z])/ig, ($1) => $1.toUpperCase().replace('-', '').replace('_', ''));
      result[camelKey] = toCamelCase(obj[key]);
      return result;
    }, {} as any);
  }
  return obj;
}

export function toSnakeCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(v => toSnakeCase(v));
  } else if (obj !== null && obj !== undefined && obj.constructor === Object) {
    return Object.keys(obj).reduce((result, key) => {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      result[snakeKey] = toSnakeCase(obj[key]);
      return result;
    }, {} as any);
  }
  return obj;
}

export const mapMemberToDB = (m: any) => {
  const { address, badges, ...base } = m;
  const mapped = { ...toSnakeCase(base) };
  if (address !== undefined) {
    mapped.address_cep = address.cep || '';
    mapped.address_street = address.street || '';
    mapped.address_number = address.number || '';
    mapped.address_neighborhood = address.neighborhood || '';
    mapped.address_city = address.city || '';
  }
  return mapped;
};

export const mapMemberFromDB = (row: any): any => {
  const camelBase = toCamelCase(row);
  const { addressCep, addressStreet, addressNumber, addressNeighborhood, addressCity, ...base } = camelBase;
  return {
    ...base,
    address: {
      cep: addressCep || '',
      street: addressStreet || '',
      number: addressNumber || '',
      neighborhood: addressNeighborhood || '',
      city: addressCity || ''
    }
  };
};

export const mapTrainingToDB = (t: any) => {
  const { players, score, ...base } = t;
  const mapped = { ...toSnakeCase(base) };
  
  if (score && typeof score === 'object') {
    mapped.score_azul = score.azul || 0;
    mapped.score_amarelo = score.amarelo || 0;
    mapped.score_raw = `${score.azul}x${score.amarelo}`;
  } else if (typeof score === 'string') {
    mapped.score_raw = score;
  }
  
  return mapped;
};

export const mapTrainingFromDB = (row: any, players: any[] = []): any => {
  const tCamel = toCamelCase(row);
  return {
    ...tCamel,
    score: {
      azul: tCamel.scoreAzul || 0,
      amarelo: tCamel.scoreAmarelo || 0
    },
    players: players.map(toCamelCase)
  };
};
