import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const PROMPT = `You are an OCR assistant for an electrical company in Malaysia.
Extract the following fields from this delivery order or job order document image.
Return ONLY valid JSON with these exact keys:
{
  "customerName": "",
  "phone": "",
  "address": "",
  "jobNumber": "",
  "product": "",
  "jobType": "DO or JO or Repair or Installation",
  "notes": ""
}
If a field is not visible or unclear, return an empty string for that field.
Do not include any text outside the JSON.`

export async function POST(req: NextRequest) {
  try {
    const { image } = await req.json()
    if (!image) return NextResponse.json({ error: 'No image provided' }, { status: 400 })

    if (!process.env.DEEPSEEK_API_KEY) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    const client = new OpenAI({
      baseURL: 'https://api.deepseek.com',
      apiKey: process.env.DEEPSEEK_API_KEY,
    })

    const params = {
      model: 'deepseek-v4-pro',
      messages: [
        {
          role: 'user' as const,
          content: [
            { type: 'image_url', image_url: { url: image } },
            { type: 'text', text: PROMPT },
          ] as OpenAI.Chat.ChatCompletionContentPart[],
        },
      ],
      thinking: { type: 'enabled' },
      reasoning_effort: 'high',
      max_tokens: 800,
      stream: false as const,
    }

    const completion = await client.chat.completions.create(
      params as unknown as OpenAI.Chat.ChatCompletionCreateParamsNonStreaming
    )

    const text = completion.choices[0]?.message?.content ?? ''

    // Strip markdown code fences if present
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const data = JSON.parse(cleaned)

    return NextResponse.json({ data })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
