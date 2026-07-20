import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET - Fetch current onboarding progress
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get onboarding progress
    const { data: progress, error: progressError } = await supabase
      .from('onboarding_progress')
      .select('*')
      .eq('customer_id', user.id)
      .single();

    if (progressError && progressError.code !== 'PGRST116') {
      // PGRST116 = no rows found
      throw progressError;
    }

    // Get business config (may have partial data)
    const { data: config } = await supabase
      .from('business_configs')
      .select('*')
      .eq('customer_id', user.id)
      .single();

    return NextResponse.json({
      progress: progress || {
        current_step: 1,
        completed_steps: [],
        draft_data: {},
      },
      config,
    });
  } catch (error) {
    console.error('Get progress error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch progress' },
      { status: 500 }
    );
  }
}
