import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// POST - Save progress for a step
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { step, data, completed } = await request.json();

    if (!step || !data) {
      return NextResponse.json(
        { error: 'Step and data are required' },
        { status: 400 }
      );
    }

    // Get current progress
    const { data: currentProgress } = await supabase
      .from('onboarding_progress')
      .select('*')
      .eq('customer_id', user.id)
      .single();

    // Merge new data with existing draft data
    const mergedData = {
      ...(currentProgress?.draft_data || {}),
      ...data,
    };

    // Update completed steps
    const completedSteps = currentProgress?.completed_steps || [];
    if (completed && !completedSteps.includes(step)) {
      completedSteps.push(step);
    }

    // Upsert progress
    const { error: progressError } = await supabase
      .from('onboarding_progress')
      .upsert(
        {
          customer_id: user.id,
          current_step: completed ? step + 1 : step,
          completed_steps: completedSteps,
          draft_data: mergedData,
        },
        {
          onConflict: 'customer_id',
        }
      );

    if (progressError) {
      throw progressError;
    }

    // Also update business_configs with the relevant data
    const configUpdate: Record<string, unknown> = {};

    // Map step data to config fields
    if (data.business_name !== undefined) {
      configUpdate.business_name = data.business_name;
    }
    if (data.business_phone !== undefined) {
      configUpdate.business_phone = data.business_phone;
    }
    if (data.industry !== undefined) {
      configUpdate.industry = data.industry;
    }
    if (data.coverage_mode !== undefined) {
      configUpdate.coverage_mode = data.coverage_mode;
    }
    if (data.business_hours !== undefined) {
      configUpdate.business_hours = data.business_hours;
    }
    if (data.services !== undefined) {
      configUpdate.services = data.services;
    }
    if (data.qa_pairs !== undefined) {
      configUpdate.qa_pairs = data.qa_pairs;
    }
    if (data.notification_email !== undefined) {
      configUpdate.notification_email = data.notification_email;
    }
    if (data.notification_sms !== undefined) {
      configUpdate.notification_sms = data.notification_sms;
    }

    if (Object.keys(configUpdate).length > 0) {
      const { error: configError } = await supabase
        .from('business_configs')
        .update(configUpdate)
        .eq('customer_id', user.id);

      if (configError) {
        console.error('Config update error:', configError);
        // Non-fatal, progress is saved
      }
    }

    return NextResponse.json({
      success: true,
      currentStep: completed ? step + 1 : step,
      completedSteps,
    });
  } catch (error) {
    console.error('Save step error:', error);
    return NextResponse.json(
      { error: 'Failed to save progress' },
      { status: 500 }
    );
  }
}
