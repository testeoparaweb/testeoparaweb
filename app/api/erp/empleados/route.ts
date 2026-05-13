import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const supabase = createAdminClient();
    const empleado = {
      sucursal_id: body.sucursal_id ?? null,
      nombre: body.nombre,
      rol: body.rol,
      turno: body.turno,
      sector: body.sector,
      estado: body.estado,
      activo: true,
      ...(body.id ? { id: body.id } : {}),
    };

    const { error } = await supabase
      .from("empleados")
      .upsert(empleado, { onConflict: body.id ? "id" : "sucursal_id,nombre" });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error desconocido" },
      { status: 500 },
    );
  }
}
