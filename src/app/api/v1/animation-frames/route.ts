import { supabase } from '@/supabase/client';
import { NextResponse } from 'next/server';


export async function GET() {
  try {
    const { data, error } = await supabase.from('log_animations').select('*');
    if (error) throw error;
    return NextResponse.json({ logAnimations: data });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch log_animations' },
      { status: 500 }
    );
  }
}
