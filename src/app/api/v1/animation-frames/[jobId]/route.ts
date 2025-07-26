import { supabase } from '@/supabase/client';
import { NextResponse } from 'next/server';

interface Params {
  params: Promise<{ jobId: string }>;
}

export async function GET(_req: Request, { params }: Params) {
  const { jobId } = await params; // await here

  if (!jobId) {
    return NextResponse.json({ error: 'Missing jobId' }, { status: 400 });
  }

  try {
    const { data, error } = await supabase
      .from('animation_frames') 
      .select('*')
      .eq('job_id', jobId)
      .order('timestamp', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ jobId, animationFrames: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
