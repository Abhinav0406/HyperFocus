import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { videoId, title, description } = await req.json();
    
    if (!videoId) {
      throw new Error('Video ID is required');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if summary already exists
    const { data: existingSummary } = await supabase
      .from('video_summaries')
      .select('*')
      .eq('video_id', videoId)
      .single();

    if (existingSummary) {
      return new Response(
        JSON.stringify(existingSummary),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate summary using Lovable AI (free Gemini!)
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('Lovable AI key not configured');
    }

    const aiPrompt = `Analyze this YouTube video and provide:
1. A concise summary (2-3 sentences)
2. 3-5 key learning points

Video Title: ${title}
Description: ${description}

Format your response as JSON with this structure:
{
  "summary": "your summary here",
  "keyPoints": ["point 1", "point 2", "point 3"]
}`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that summarizes educational video content. Always respond with valid JSON only.'
          },
          {
            role: 'user',
            content: aiPrompt
          }
        ],
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        throw new Error('Rate limit exceeded. Please try again in a moment.');
      }
      if (aiResponse.status === 402) {
        throw new Error('AI credits depleted. Please add credits to your workspace.');
      }
      throw new Error('AI request failed');
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices[0].message.content;
    
    // Parse AI response
    let parsedContent;
    try {
      // Try to extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      parsedContent = JSON.parse(jsonMatch ? jsonMatch[0] : content);
    } catch {
      // Fallback if parsing fails
      parsedContent = {
        summary: content,
        keyPoints: []
      };
    }

    // Store summary in database
    const { data: newSummary, error: insertError } = await supabase
      .from('video_summaries')
      .insert({
        video_id: videoId,
        summary: parsedContent.summary,
        key_points: parsedContent.keyPoints
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error storing summary:', insertError);
      throw insertError;
    }

    return new Response(
      JSON.stringify(newSummary),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-summary function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});