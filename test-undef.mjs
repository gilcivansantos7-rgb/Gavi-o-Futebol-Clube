import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  try {
    const obj = { name: "Test", phone: undefined };
    console.log("Inserting:", obj);
    const { data, error } = await supabase.from('members').insert([obj]);
    console.log("Result:", error ? error.message : "Success");
  } catch (err) {
    console.error("THREW AN EXCEPTION!", err);
  }
}
test();
