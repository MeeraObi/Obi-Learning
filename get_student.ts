import { createClient } from './src/utils/supabase/server';
async function run() {
    const supabase = await createClient();
    const { data } = await supabase.from('children').select('id').limit(1);
    console.log(data?.[0]?.id || 'none');
}
run();
