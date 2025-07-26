import { supabase } from '@/supabase/client';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Select all rows with all columns
    const { data, error } = await supabase
      .from('log_stats')
      .select('*');

    if (error) throw error;

    return NextResponse.json({ logStats: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
