import { generatePremiumPDF } from "@/utils/generatePremiumPDF";

export const runtime = "nodejs";

function safeFilenamePart(value: unknown) {
  const raw = String(value ?? "").trim() || "Report";
  return raw
    .replace(/[\\/]/g, "-")
    .replace(/[\r\n\t]/g, " ")
    .replace(/\s+/g, " ")
    .replace(/"/g, "")
    .slice(0, 80);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);

  const name = String(body?.name || "").trim() || "Customer";

  const pdfBytes = generatePremiumPDF({
    userName: name,
    propertyPrice: Number(body?.propertyPrice) || 0,
    monthlySIP: Number(body?.monthlySIP) || 0,
    years: Number(body?.years) || 15,
    wealthGap: body?.wealthGap,
    sipValue: body?.sipValue,
    propValue: body?.propValue,
  });

  const filename = `${safeFilenamePart(name)}_Property_Report.pdf`;

  return new Response(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
