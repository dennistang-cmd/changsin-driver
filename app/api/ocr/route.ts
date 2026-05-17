import { NextRequest, NextResponse } from 'next/server'

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

    const apiKey = process.env.DEEPSEEK_API_KEY
    if (!apiKey) return NextResponse.json({ error: 'API key not configured' }, { status: 500 })

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-vl2',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'image_url', image_url: { url: image } },
              { type: 'text', text: PROMPT },
            ],
          },
        ],
        max_tokens: 300,
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      return NextResponse.json({ error: `DeepSeek error: ${err}` }, { status: 500 })
    }

    const result = await response.json()
    const text = result.choices?.[0]?.message?.content ?? ''

    // Strip markdown code fences if present
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const data = JSON.parse(cleaned)

    return NextResponse.json({ data })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
