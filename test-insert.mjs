import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
  const newMember = {
    id: 'test-id-1234',
    name: 'Test Member',
    email: 'test@example.com',
    cpf: '000.000.000-00',
    birth_date: '1990-01-01',
    phone: '0000000000',
    address_cep: '00000-000',
    address_street: 'Rua',
    address_number: '123',
    address_neighborhood: 'Bairro',
    address_city: 'Cidade',
    monthly_fee: 100,
    status: 'Ativo',
    created_at: new Date().toISOString(),
    created_by: 'Sistema'
  };

  const { data, error } = await supabase.from('members').insert([newMember]).select();
  if (error) {
    console.error("Supabase insert error (members):", JSON.stringify(error, null, 2));
  } else {
    console.log("Insert successful (members):", data);
  }

  // Also test trainings because of players
  const newTraining = {
    id: 'test-training-1234',
    date: new Date().toISOString(),
    score_raw: '0x0',
    created_at: new Date().toISOString(),
    created_by: 'Sistema'
  };

  const { data: tData, error: tError } = await supabase.from('trainings').insert([newTraining]).select();
  if (tError) {
    console.error("Supabase insert error (trainings):", JSON.stringify(tError, null, 2));
  } else {
    console.log("Insert successful (trainings):", tData);
  }

  // And test payment
  const newPayment = {
    id: 'test-payment-1234',
    member_id: 'test-id-1234',
    member_name: 'Test Member',
    month: 5,
    year: 2026,
    amount: 100,
    status: 'Pendente',
    due_date: new Date().toISOString(),
    created_at: new Date().toISOString(),
    created_by: 'Sistema'
  };

  const { data: pData, error: pError } = await supabase.from('payments').insert([newPayment]).select();
  if (pError) {
    console.error("Supabase insert error (payments):", JSON.stringify(pError, null, 2));
  } else {
    console.log("Insert successful (payments):", pData);
  }
}

testInsert();
