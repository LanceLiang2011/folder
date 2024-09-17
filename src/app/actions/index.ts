"use server";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";

export async function analyzeFileName(prevState: any, formData: FormData) {
  const files = formData.get("files");
  console.log({ files });

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

  const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

  const OutcomeEvent = z.object({
    location: z.string(),
    people: z.string(),
    cause: z.string(),
  });

  const OutcomeEventResponse = z.object({
    events: z.array(OutcomeEvent),
  });

  const systemMessage =
    "You will be given a list of filenames with date and location, followed by people involved, cause of the event, optionally outcome (镇压) and TikTok account in Chinese. Please extract location, people involved and cause of the event in the JSON format";

  const completion = await openai.beta.chat.completions.parse({
    model: "gpt-4o-2024-08-06",
    messages: [
      { role: "system", content: systemMessage },
      {
        role: "user",
        content: files?.toString() || "",
      },
    ],
    response_format: zodResponseFormat(OutcomeEventResponse, "events"),
  });

  const responseText = completion.choices[0]?.message.content;

  console.log({ responseText });

  return { message: responseText };
}
