import { assetResponse } from "@/lib/storage";

export async function GET(_req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  return assetResponse("cutouts", (await params).path);
}
