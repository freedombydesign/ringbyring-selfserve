import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET - Fetch current business config
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

    const { data: config, error } = await supabase
      .from('rbr_business_configs')
      .select('*')
      .eq('customer_id', user.id)
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ config });
  } catch (error) {
    console.error('Get config error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch config' },
      { status: 500 }
    );
  }
}

// PUT - Update business config
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const updates = await request.json();

    // Only allow updating certain fields
    const allowedFields = [
      'business_name',
      'business_phone',
      'industry',
      'business_hours',
      'coverage_mode',
      'services',
      'qa_pairs',
      'notification_email',
      'notification_sms',
      'custom_greeting',
    ];

    const filteredUpdates: Record<string, unknown> = {};
    for (const key of allowedFields) {
      if (updates[key] !== undefined) {
        filteredUpdates[key] = updates[key];
      }
    }

    if (Object.keys(filteredUpdates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    const { data: config, error } = await supabase
      .from('rbr_business_configs')
      .update(filteredUpdates)
      .eq('customer_id', user.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ config });
  } catch (error) {
    console.error('Update config error:', error);
    return NextResponse.json(
      { error: 'Failed to update config' },
      { status: 500 }
    );
  }
}
