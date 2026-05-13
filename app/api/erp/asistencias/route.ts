import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("asistencias")
      .insert(body)
      .select("id,empleado_id,empleado,tipo,turno,creado")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ asistencia: data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error desconocido" },
      { status: 500 },
    );
  }
}
