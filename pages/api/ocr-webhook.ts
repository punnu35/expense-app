import { NextApiRequest, NextApiResponse } from "next";
import { ImageAnnotatorClient } from "@google-cloud/vision";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

const credentials = JSON.parse(process.env.GCP_CREDENTIALS_JSON!);
const vision = new ImageAnnotatorClient({ credentials });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { expenseId, imageUrl } = req.body;
    if (!expenseId || !imageUrl) {
      return res.status(400).json({ error: "Missing expenseId or imageUrl" });
    }

    // Download image (public or presigned URL)
    const [result] = await vision.textDetection(imageUrl);
    const detections = result.textAnnotations || [];
    const fullText = detections[0]?.description || "";

    // Simple regex-based parsing for demo
    const amountMatch = fullText.match(/\$?\s?(\d+\.\d{2})/);
    const merchantMatch = fullText.match(/(?:at|from)\s([A-Za-z0-9 &]+)/i);
    const dateMatch = fullText.match(/(\d{1,2}\/\d{1,2}\/\d{2,4})/);

    const parsed = {
      merchant: merchantMatch?.[1]?.trim() || null,
      amount: amountMatch?.[1] ? parseFloat(amountMatch[1]) : null,
      date: dateMatch?.[1] || null,
      raw_text: fullText
    };

    // Update Supabase record
    await supabase
      .from("expenses")
      .update({
        parsed_data: parsed,
        status: "parsed"
      })
      .eq("id", expenseId);

    return res.status(200).json({ success: true, parsed });
  } catch (err: any) {
    console.error("OCR error", err);
    return res.status(500).json({ error: err.message });
  }
}
