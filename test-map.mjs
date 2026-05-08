import { toSnakeCase, mapMemberToDB, mapMemberFromDB } from './src/lib/utils.ts';
// Wait, I can't import TS directly in node unless I use tsx.
// Let's just copy the function here to test it.
function toSnakeCaseLocal(obj) {
  if (Array.isArray(obj)) {
    return obj.map(v => toSnakeCaseLocal(v));
  } else if (obj !== null && obj.constructor === Object) {
    return Object.keys(obj).reduce((result, key) => {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      result[snakeKey] = toSnakeCaseLocal(obj[key]);
      return result;
    }, {});
  }
  return obj;
}

const mapMemberToDBLocal = (m) => {
  const { address, badges, ...base } = m;
  const mapped = {
    ...toSnakeCaseLocal(base),
  };
  if (address) {
      mapped.address_cep = address.cep || '';
      mapped.address_street = address.street || '';
      mapped.address_number = address.number || '';
      mapped.address_neighborhood = address.neighborhood || '';
      mapped.address_city = address.city || '';
  }
  return mapped;
};

const newMember = {
    id: '123',
    name: 'Test',
    email: 'test@example.com',
    cpf: '123',
    birthDate: '1990-01-01',
    phone: '123',
    address: {
        cep: '123',
        street: '123',
        number: '123',
        neighborhood: '123',
        city: '123'
    },
    monthlyFee: 100,
    status: 'Ativo',
    createdAt: new Date().toISOString(),
    createdBy: 'Sistema'
};

console.log(JSON.stringify(mapMemberToDBLocal(newMember), null, 2));
