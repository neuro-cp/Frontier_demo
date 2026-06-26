import { NextResponse } from "next/server";

import { mergeBusinessTypes } from "@/lib/businessTypes";
import { createServiceRoleClient } from "@/lib/platformAdmin/server";

export async function GET() {
  try {
    const serviceClient = createServiceRoleClient();
    const { data, error } = await serviceClient
      .from("business_type_suggestions")
      .select("display_name")
      .eq("status", "approved")
      .order("display_name", { ascending: true });

    if (error) throw new Error(error.message);

    return NextResponse.json({
      businessTypes: mergeBusinessTypes(
        (data ?? []).map((row) => row.display_name).filter(Boolean)
      ),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to load business types.",
      },
      { status: 500 }
    );
  }
}
