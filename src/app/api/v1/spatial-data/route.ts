import { supabase } from '@/supabase/client';
import { NextResponse } from 'next/server';


export async function GET() {
  try {
    const { data, error } = await supabase.from('log_spatial_data').select('*');
    if (error) throw error;
    return NextResponse.json({ logSpatialData: data });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch log_spatial_data' },
      { status: 500 }
    );
  }
}
