# Cost comparison for TTS
_Exported on 7/23/2026 at 09:31:37 CST from Cursor (3.9.16)_

---

**User**

@/Users/juanluissv/.cursor/projects/Users-juanluissv-Desktop-tutors23/agent-transcripts/c2819a52-640f-46c1-aaf7-4ab4714787cc/c2819a52-640f-46c1-aaf7-4ab4714787cc.jsonl how does cost compare for my chat q and a for text to speech between what I have now OpenAI gpt-4o-mini-tts and elevenlabs ? https://elevenlabs.io/pricing/api 

---

**Cursor**

I'll review your chat Q&A TTS setup and current OpenAI usage, then compare it to ElevenLabs pricing.


Pulling the prior cost estimate from the 

transcript and checking typical chat answer lengths.


## Your chat Q&A TTS setup

For chat audio, only **`ttsController.js`** matters — not `generateVideoTts.js` (that's for lesson videos).

```31:36:src/controllers/ttsController.js
        const response = await openai.audio.speech.create({
            model: "gpt-4o-mini-tts",
            voice: "marin", // Options: alloy, ash, ballad, coral, echo, fable, nova, onyx, sage, shimmer, verse, marin, cedar
            input: text,
            response_format: "mp3" // MP3 for better streaming compatibility
        });
```

When a student taps play on an answer, `HomeScreen.jsx` sends the **full answer text** to `POST /api/tts`. Each replay is a **new API call** (no caching).

---

## Billing models differ

| | **OpenAI `gpt-4o-mini-tts`** | **ElevenLabs** |
|---|---|---|
| **How you're billed** | Audio output tokens (~duration of speech) | Input **characters** in the text |
| **Rough unit price** | ~**$0.015 / minute** of audio | **$0.05–$0.10 / 1K characters** |
| **Spanish Q&A quality tier** | Included in one model | Multilingual v2/v3 recommended ($0.10/1K) |

Sources: [OpenAI pricing](https://developers.openai.com/api/docs/pricing), [ElevenLabs API pricing](https://elevenlabs.io/pricing/api)

---

## Same scenario: 1 student, 30 questions/month, audio every answer

Assuming a typical tutor answer of **~400–700 characters** (~45 sec spoken), which matches the estimate from your [prior chat](c2819a52-640f-46c1-aaf7-4ab4714787cc):

### Per answer

| Answer length | OpenAI (current) | ElevenLabs Flash/Turbo | ElevenLabs Multilingual v2/v3 |
|---|---|---|---|
| Short (~250 chars, ~20 sec) | **~$0.005** | **~$0.013** | **~$0.025** |
| Typical (~550 chars, ~45 sec) | **~$0.011** | **~$0.028** | **~$0.055** |
| Long (~1,100 chars, ~90 sec) | **~$0.023** | **~$0.055** | **~$0.110** |

### Monthly (30 answers)

| Scenario | OpenAI | ElevenLabs Flash | ElevenLabs Multilingual |
|---|---|---|---|
| Short answers | **~$0.15** | **~$0.39** | **~$0.75** |
| **Typical** | **~$0.33** | **~$0.83** | **~$1.65** |
| Long answers | **~$0.69** | **~$1.65** | **~$3.30** |

**Bottom line for chat Q&A:** OpenAI is roughly **2.5× cheaper** than ElevenLabs Flash/Turbo and **~5× cheaper** than ElevenLabs Multilingual v2/v3 at pay-as-you-go rates.

---

## ElevenLabs subscriptions don't help at this volume

ElevenLabs plans bundle characters, but the **subscription fee** dominates at low usage:

| Plan | Monthly cost | Included chars (Multilingual) | Covers ~30 typical answers? |
|---|---|---|---|
| Creator | $22/mo ($11 first month) | 220k | Yes (~18k needed) — but **$22 >> $0.33** |
| Pay-as-you-go | $0 base | — | **~$1.65/mo** at typical usage |

For **1 student**, OpenAI pay-as-you-go (~**$0.33/mo**) beats any ElevenLabs option. A Creator subscription only makes sense if you're already using ElevenLabs heavily elsewhere (e.g. video narration, podcasts).

---

## Quick formulas

```
OpenAI monthly  ≈ questions × audio_minutes × $0.015
ElevenLabs monthly ≈ total_characters_spoken ÷ 1,000 × rate
  Flash/Turbo rate = $0.05
  Multilingual v2/v3 rate = $0.10
```

Example (typical):
```
OpenAI:     30 × 0.75 min × $0.015  ≈ $0.34/mo
ElevenLabs: 30 × 550 chars × $0.10/1K ≈ $1.65/mo  (Multilingual)
ElevenLabs: 30 × 550 chars × $0.05/1K ≈ $0.83/mo  (Flash)
```

---

## When ElevenLabs might still be worth it

ElevenLabs isn't the cheaper option for chat Q&A at your current scale, but it can win on:

- **Voice cloning** — custom tutor voice (OpenAI has fixed preset voices like `marin`)
- **Voice quality / expressiveness** for Spanish — subjective, worth A/B testing
- **Consistent character-based billing** — cost tied to text length, not speech duration
- **Unified stack** — if you later add podcasts or video narration with ElevenLabs anyway

---

## Scale snapshot (100 students, same usage)

| Provider | ~Monthly TTS cost |
|---|---|
| OpenAI `gpt-4o-mini-tts` | **~$33** |
| ElevenLabs Flash (PAYG) | **~$83** |
| ElevenLabs Multilingual (PAYG) | **~$165** |
| ElevenLabs Scale plan ($299/mo, 2.99M chars) | **$299 flat** (only breaks even vs OpenAI at much higher volume) |

---

**Practical takeaway:** For chat Q&A audio, **keep OpenAI `gpt-4o-mini-tts`** — it's the clear cost winner at 1 question/day and stays much cheaper even at moderate scale. ElevenLabs Multilingual is the quality tier you'd compare for Spanish; Flash is the budget ElevenLabs option, but still ~2.5× OpenAI for this use case.

If you want, I can also compare costs for **lesson video narration** via `generateVideoTts.js` (much longer text per call — that's where the gap narrows or subscription plans start to matter).

