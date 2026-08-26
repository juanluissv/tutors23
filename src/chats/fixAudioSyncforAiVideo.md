# Video script lesson generation
_Exported on 7/21/2026 at 17:10:02 CST from Cursor (3.9.16)_

---

**User**

explain to me how we generate the video script lesson @src/controllers/bookLessonsController.js:929-930 

---

**Cursor**

I'll trace `generateVideoScriptFromLesson` and the helpers it calls so I can walk you through the full script-generation flow.

Next I'll dig into the util that actually builds the script — briefing extraction, OpenAI calls, and the map/reduce path.

Video script generation starts at the school-admin endpoint and ends with a structured `videoScript` saved on the `BookLessons` document. Here’s the flow.

## Entry point

**Route:** `POST /api/subjects/:id/book-chapters/:chapterId/generate-video-script`  
(school admin only)

The UI calls this from `SchoolAdminCreateTutor` via the RTK mutation `generateVideoScriptFromLesson`.

## Controller (`generateVideoScriptFromLesson`)

```929:993:src/controllers/bookLessonsController.js
const generateVideoScriptFromLesson = asyncHandler(async (req, res) => {
	const { id, chapterId } = req.params
	const { subject } = await loadSubjectForSchoolAdmin(req, res, id)
	// ... validate chapter ...
	const lesson = await BookLessons.findOne({
		subject: subject._id,
		'bookChapter.chapterId': chapter._id,
	})
	// ... require existing web lesson with content ...
	videoScript = await generateVideoScript(lesson)
	lesson.videoScript = videoScript
	await lesson.save()
	res.status(200).json({ /* formatted videoScript */ })
})
```

Steps:

1. Load the subject (school-admin auth).
2. Find the chapter and its existing **web lesson** (`BookLessons`).
3. Fail if there’s no lesson or empty `content` — the web lesson must exist first.
4. Call `generateVideoScript(lesson)` from `src/utils/generateVideoScript.js`.
5. Persist `lesson.videoScript` and return a formatted version via `formatVideoScript`.

## Core generation (`generateVideoScript`)

### 1. Build a structured briefing

`buildVideoScriptBrief(lesson)` does **not** send the whole lesson blindly. It:

- Pulls only the **Profundización** phase blocks (stops at Consolidación).
- Skips activities/phases.
- Extracts charts, glossary, maps, docs, regional sections, key facts, objectives.
- Can **infer charts from document percentages** (e.g. cultivo/pastoreo %).
- Builds a `requiredElements` checklist used later for coverage checks.

### 2. Choose generation strategy

Source text = profundización text, or full lesson text as fallback.

| Lesson text size | Strategy |
|---|---|
| ≤ 28,000 chars | **Single-pass** — one GPT call with the full system prompt |
| > 28,000 chars | **Map-reduce** — chunk → partial scenes → reduce into one script |

Model: `gpt-4o-mini`, `temperature: 0.3`, JSON response.

### 3. Map-reduce (long lessons)

1. Split text into ~2500-char chunks (250 overlap).
2. **Map** (2 concurrent): each chunk → 2–4 partial scenes.
3. **Collapse** if the combined scene list is too large for the reduce prompt.
4. **Reduce**: merge into one coherent 12–18 scene script.
5. If map/reduce fails → fall back to single-pass.

### 4. Coverage refine (up to 2 passes)

`analyzeScriptCoverage` checks for missing pieces against the brief:

- title, objectives, ≥2 concepts  
- one chart scene per chart  
- glossary (bulletList or definitions)  
- map, regional sections  
- summary, outro  
- ≥12 scenes, ≥300s estimated duration  

If gaps exist, `refineVideoScript` asks the model to fill them without deleting good scenes. A second refine runs if still under 12 scenes.

### 5. Finalize

`finalizeVideoScript`:

- Normalizes scene types/fields (handles Spanish aliases like `narracion`, `tipo`).
- Caps at 18 scenes.
- Rebuilds `fullNarration` = all narrations joined by space.
- Sets `estimatedDurationSeconds` = sum of scene durations.
- Stamps `generatedAt`.

## Output shape

Each scene can include: `sceneNumber`, `type`, `title`, `narration`, `durationSeconds`, `visualNotes`, plus type-specific fields (`data` for charts, `regions` for maps, `items` for bullet lists, etc.).

Target: **12–18 scenes**, **5–8 minutes**, Spanish narration ready for TTS.

## Where it sits in the pipeline

```
Web lesson → Video script → TTS audio → Scene illustrations → Creatomate animated video
```

This endpoint only does the script. Audio, illustrations, and video are separate endpoints that depend on `lesson.videoScript`.

---

**User**

I just generate the audio video script and save the data here @src/utils/generateVideoScript.js , according to @src/utils/lesson1dbData.json:1176-1177 @src/utils/lesson1dbData.json:1184-1185 , how long is the audio going to last ?

---

**Cursor**

I'll check how TTS uses the script — whether audio length comes from `estimatedDurationSeconds` / scene `durationSeconds`, or from speaking `fullNarration`.

**Script estimate: ~7 min 35 sec (455 seconds).** That is the sum of all scene `durationSeconds` (18 scenes). Scene 1’s `10` is only the title scene, not the full audio.

**Important:** TTS does **not** use those fields. `generateVideoTts` only speaks `fullNarration`. Actual MP3 length is whatever OpenAI TTS takes for that text.

| Source | Duration |
|---|---|
| `estimatedDurationSeconds` / sum of scenes | **455s (~7:35)** — planning target for video timing |
| Rough TTS from ~566 words (`fullNarration`) | **~4–5 min** at a paced Spanish narration rate |

So: the script *targets* ~7.5 minutes for the animated video timeline; the audio file will likely land closer to **4–5 minutes** unless narration is stretched or pacing is very slow.

---

**User**

and how generate video script audio works ? @src/controllers/bookLessonsController.js:997-998 @src/utils/generateVideoTts.js:136-137 

---

**Cursor**

I'll walk through the audio endpoint and the TTS util end-to-end.

## How video script audio works

**Route:** `POST /api/subjects/:id/book-chapters/:chapterId/generate-video-audio`

### Controller flow

1. Load subject + chapter (school admin).
2. Find the `BookLessons` for that chapter.
3. Require an existing video script with `fullNarration` (from `formatVideoScript`).
4. Require S3 configured.
5. Call `generateVideoTts(videoScript.fullNarration)` — **only the narration text**, not scene durations.
6. Upload the MP3 to S3.
7. Save `lesson.videoScriptAudioFileId`, plus `audioGeneratedAt` / `audioVoice` on `videoScript`.
8. Delete the previous audio file if it existed.
9. Return the new file id/url.

### TTS util (`generateVideoTts`)

```136:152:src/utils/generateVideoTts.js
async function generateVideoTts (text, options = {}) {
	const narration = String(text ?? '').trim()
	// ...
	const chunks = splitTextForTts(narration)
	// synthesize each chunk with OpenAI, then concat
	return concatMp3Buffers(buffers)
}
```

| Piece | Value |
|---|---|
| Model | `gpt-4o-mini-tts` |
| Voice | `marin` (default) |
| Style | Spanish, clear, paced educational narrator |
| Format | MP3 |

Steps inside the util:

1. Split narration if longer than **3800 chars** (prefer cut at `. `, else space).
2. For each chunk, call OpenAI Speech API → MP3 buffer.
3. If multiple chunks: write temp files → **ffmpeg concat** → one MP3 buffer.
4. Return that buffer to the controller for S3 upload.

### What it ignores

`durationSeconds` / `estimatedDurationSeconds` are **not** used. Audio length = how long TTS takes to speak `fullNarration`.

### Pipeline position

```
Video script (fullNarration) → TTS MP3 on S3 → later used by Creatomate animated video
```

---

**User**

so if generateVideoTts @src/utils/generateVideoTts.js:136-137 only takes fullNarration @src/utils/lesson1dbData.json:1175 what are the scenes for ? @src/utils/lesson1dbData.json:1177-1178 ?

---

**Cursor**

Scenes aren't for TTS — I'll confirm what downstream steps actually consume them.

`fullNarration` is the **voice track**. `scenes` are the **visual timeline**.

TTS only needs one continuous string of speech. Scenes exist for everything else in the video pipeline:

| Field | Used by | Purpose |
|---|---|---|
| `fullNarration` | TTS | One continuous narration MP3 |
| `scenes[]` | Illustrations + Creatomate | What shows on screen, when, and how |

Each scene is a timed visual beat:

- **type** — layout (title, chart, map, regional, etc.)
- **title / narration / visualNotes** — on-screen text + what to draw
- **durationSeconds** — how long that beat stays on screen
- **data / regions / items** — chart numbers, map regions, glossary bullets
- **illustrationFileId** (added later) — generated image for that beat

`fullNarration` itself is built from scenes:

```618:618:src/utils/generateVideoScript.js
	const fullNarration = scenes.map((scene) => scene.narration).join(' ')
```

So for your lesson:

```
scenes (18 visual beats, ~455s planned)
   ├─ each scene.narration  ──► joined into fullNarration
   │                              └─► TTS → one MP3
   ├─ illustrations per scene
   └─ Creatomate stitches scenes + MP3 into the final video
```

**Short version:** scenes define *what the video looks like and how it’s cut*; `fullNarration` is just those narrations flattened so TTS can speak them as one track.

---

**User**

fullNarration itself is built from scenes ? ok so the text that I have in fullNarration @src/utils/lesson1dbData.json:1175-1176 is the same text that I have in scenes.narration ? @src/utils/lesson1dbData.json:1177-1178 @src/utils/lesson1dbData.json:1183 ?

---

**Cursor**

Yes. In your file they match exactly.

`fullNarration` is all 18 `scenes[].narration` values joined with a single space:

```
scene1.narration + " " + scene2.narration + " " + ... + scene18.narration
```

So the text at line 1183 is the **start** of `fullNarration`, then each following scene’s narration is appended in order. Nothing extra is added beyond those scene narrations.

---

**User**

ok I generate the audio for the video (generateVideoTts) @/Users/juanluissv/Desktop/tutor23videos/semana1unidad1.mp3 and the audio length is 4:13, this is the transcript @/Users/juanluissv/Desktop/tutor23videos/semana1unidad11.txt, why is the audio length so different from the estimate @src/utils/lesson1dbData.json:1176-1177 ? is that going to affect when I generate the video in creatomate ?

---

**Cursor**

I'll compare the estimate to your real audio, then check how Creatomate syncs scene durations to the narration track.

**Yes — the mismatch is real, and it will affect Creatomate sync.**

### Why 4:13 vs 455s?

| Source | Duration | What it is |
|---|---|---|
| `estimatedDurationSeconds` | **455s (~7:35)** | Sum of LLM-assigned `scene.durationSeconds` (planning targets) |
| Your MP3 | **~253.8s (4:13)** | Actual TTS speaking time of `fullNarration` |

Those scene durations are **guesses** (“this chart should last ~30s”), not measured speech. TTS ignores them and speaks at a natural pace, so the audio is much shorter.

### Will Creatomate care?

**Yes.** The render script builds the video timeline from scene durations, not from audio length:

```805:820:src/utils/buildCreatomateRenderScript.js
	let cursor = 0
	const compositions = scenes.map((scene, index) => {
		const comp = buildSceneComposition(scene, cursor, index)
		cursor += comp.duration
		return comp
	})
	const totalDuration = cursor
	// audio element gets duration: totalDuration (≈455s)
```

So Creatomate will roughly produce:

- **Video length:** ~455s (scene timeline)
- **Narration:** ~4:13 of speech, then **silence** for the remaining ~3+ minutes
- **Worse:** visuals and voice **won’t stay in sync** — speech finishes each beat faster than the planned scene windows, so by mid-video the voice is ahead of what’s on screen

Nothing in the current pipeline re-times scenes from the real MP3 duration.

### Bottom line

The estimate is optimistic pacing for the *video cuts*. Your audio is the real duration. Until scene timings are scaled/recomputed from the actual audio (or TTS is paced to match scene durations), Creatomate will make a longer video with silent tail and drifting A/V.

---

**User**

ok ... so how can we fix this ?

---

**Cursor**

I'll outline practical fix options that fit your current pipeline, starting with the simplest sync approach.

Best fix: **retarget scene durations to the real audio length** before Creatomate builds the timeline. Right now Creatomate trusts LLM guesses; it should trust the MP3.

## Recommended approach (best fit for your code)

### 1. After TTS, probe the real MP3 duration
Use `ffprobe` (you already use `ffmpeg-static`) on the uploaded audio → e.g. `253.8s`.

### 2. Redistribute that duration across scenes by narration weight
Weight by word/char count of each `scene.narration` (not the old `durationSeconds`):

```text
sceneDuration = audioDuration * (sceneWords / totalWords)
```

Optional: keep a small floor (e.g. 2–3s) for title/outro, then renormalize so the sum still equals audio duration.

### 3. Persist the retimed script
Save updated `scenes[].durationSeconds` + `estimatedDurationSeconds = audioDuration` on the lesson when audio is generated (in `generateVideoScriptAudioFromLesson`).

### 4. Build Creatomate from those retimed values
`buildCreatomateRenderScript` already uses `scene.durationSeconds` and sets video/`audio` duration to their sum — so once scenes match the MP3, timeline and voice stay aligned, with no silent tail.

For your lesson roughly: scale factor `253.8 / 455 ≈ 0.56` → a 30s scene becomes ~17s, etc.

---

## Better (more accurate) later: per-scene TTS

Generate one MP3 per scene, measure each clip’s duration, concat them for the full track. Then each scene’s visual window = its own clip length. Stronger sync, more API calls/cost/complexity.

---

## What not to do as the main fix

- Don’t stretch the audio to 455s (sounds unnatural).
- Don’t only change `estimatedDurationSeconds` without rewriting scene durations — Creatomate uses per-scene `durationSeconds`.
- Don’t leave LLM durations as the source of truth after TTS exists.

---

## Practical place to hook it

| Step | Where |
|---|---|
| Probe MP3 | new helper next to `generateVideoTts.js` |
| Retarget scenes | after successful S3 upload in `generateVideoScriptAudioFromLesson` |
| Creatomate | keep using retimed `videoScript.scenes` in `buildCreatomateRenderScript` |

Also set the Creatomate audio element duration to the **probed** audio length (or the retimed sum), not a longer estimated total.

---

If you want this implemented, switch to Agent mode and I can wire probe + proportional retiming into the audio generation step.

---

**User**

yes please help me fix this now 

---

**Cursor**

I'll implement audio-duration probing and proportional scene retiming after TTS, then wire it into the audio-generation flow.

I'll add MP3 duration probing (via ffmpeg) and scene retiming, then hook both into the audio-generation controller.

Creatomate was clamping scenes to at least 3s, which would undo retiming — I'll align that with the actual durations.

Fixed. After TTS, scene timings are now aligned to the real MP3 length.

### What changed

1. **`probeMp3DurationSeconds`** (`generateVideoTts.js`) — measures the MP3 with ffmpeg.
2. **`retimeVideoScriptToAudio.js`** — redistributes `scenes[].durationSeconds` by narration word weight so they sum to the real audio length.
3. **`generateVideoScriptAudioFromLesson`** — after TTS, probes duration, retimes scenes, saves `audioDurationSeconds` + updated `estimatedDurationSeconds`.
4. **`buildCreatomateRenderScript`** — if `audioDurationSeconds` is set and scenes don’t match, retimes again before render; video/audio duration uses the real length.

Verified with your `semana1unidad1.mp3`: **455s → 253.85s** timeline, Creatomate duration matches.

### What you need to do

**Regenerate video audio** for this chapter (and any chapter that already has audio). Existing DB rows still have the old 455s scene durations until audio is generated again with this code.

---

**User**

ok I regenerate the audio: @/Users/juanluissv/Desktop/tutor23videos/unidad1Semana1.mp3 and I Transcribed it @/Users/juanluissv/Desktop/tutor23videos/unidad1Semana1.txt and here is the new data that get saved in the database @src/utils/lesson1dbData.json, can you review it and check that the audio length got fix, and that the video duration will not have silent scenes ?

---

**Cursor**

I'll compare the new MP3 duration, transcript, and saved `videoScript` timings to confirm they align.

**Yes — the length fix worked. Creatomate will not leave a silent tail.**

| Check | Result |
|---|---|
| MP3 probed | **248.9s (~4:09)** |
| Transcript ends | **4:09** |
| `audioDurationSeconds` | **248.9** |
| `estimatedDurationSeconds` | **248.9** |
| Sum of scene durations | **248.9** |
| Creatomate video + audio duration | **248.9** |
| Silent tail | **0s** |

Scenes were retimed from the old ~455s plan down to the real audio. `fullNarration` still matches joined `scenes.narration`.

One small content note (not a silent-end issue): scene 16 (`bulletList` “Glosario”) has narration `"Glosario"` only → **2.38s**. It will flash briefly with almost no spoken glossary terms; the glossary text may still appear on screen from `items`, but voice barely covers it. Worth fixing in a later script pass if you care about that beat.

Overall: regenerate audio succeeded; timeline and MP3 length match, so you should not get silent scenes at the end.

