
import { supabase } from '@/supabase/client';
import { NextResponse } from 'next/server';


interface Params {
  params: { jobId: string };
}

export async function GET(_req: Request, { params }: Params) {
  const { jobId } = params;

  if (!jobId) {
    return NextResponse.json({ error: 'Missing jobId' }, { status: 400 });
  }

  try {
    const { data, error } = await supabase
      .from('logs') // Adjust table name
      .select('*')
      .eq('job_id', jobId);

    if (error) throw error;

    return NextResponse.json({ jobId, logs: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
