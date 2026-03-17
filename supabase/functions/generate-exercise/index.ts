import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { difficulty, exerciseType, userProgress } = await req.json();

    const exerciseTemplates = {
      beginner: {
        pronunciation: [
          { words: ["cat", "dog", "bat", "hat", "mat"], title: "Simple Sounds" },
          { words: ["red", "blue", "green", "yellow", "black"], title: "Color Words" },
          { words: ["one", "two", "three", "four", "five"], title: "Number Practice" },
        ],
        articulation: [
          { words: ["pa", "ta", "ka", "ba", "da"], title: "Consonant Drills" },
          { words: ["ma", "na", "la", "ra", "wa"], title: "Sound Clarity" },
        ],
      },
      intermediate: {
        pronunciation: [
          { words: ["beautiful", "wonderful", "fantastic", "amazing", "incredible"], title: "Multi-Syllable Words" },
          { words: ["restaurant", "comfortable", "temperature", "yesterday", "tomorrow"], title: "Complex Words" },
        ],
        fluency: [
          { words: ["how are you today", "thank you very much", "nice to meet you"], title: "Common Phrases" },
        ],
      },
      advanced: {
        fluency: [
          { words: ["she sells seashells by the seashore", "peter piper picked a peck"], title: "Tongue Twisters Advanced" },
          { words: ["the quick brown fox jumps over the lazy dog"], title: "Pangram Challenge" },
        ],
      },
    };

    const templates = exerciseTemplates[difficulty]?.[exerciseType] || exerciseTemplates.beginner.pronunciation;
    const randomTemplate = templates[Math.floor(Math.random() * templates.length)];

    const pointsValue = difficulty === 'beginner' ? 10 : difficulty === 'intermediate' ? 20 : 30;

    const exercise = {
      title: randomTemplate.title,
      description: `Practice ${exerciseType} with ${difficulty} level exercises`,
      difficulty: difficulty,
      type: exerciseType,
      target_words: randomTemplate.words,
      instructions: `Say each word or phrase clearly. Focus on pronunciation and clarity.`,
      points_value: pointsValue,
    };

    return new Response(
      JSON.stringify({ exercise }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
