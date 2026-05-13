import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      id: string;
      nombre: string;
      categoria?: string;
      disponible: boolean;
      color: string;
      stock: number;
      stock_minimo: number;
      unidad: string;
    };
    const supabase = createAdminClient();

    const payload = {
      id: body.id,
      nombre: body.nombre,
      categoria: body.categoria?.trim() || "Sin categoria",
      disponible: body.disponible,
      color: body.color,
      stock: body.stock,
      stock_minimo: body.stock_minimo,
      unidad: body.unidad,
    };

    let { error } = await supabase
      .from("gustos")
      .upsert(payload, { onConflict: "id" });

    if (error?.code === "42703" || error?.code === "PGRST204") {
      ({ error } = await supabase.from("gustos").upsert(
        {
          id: body.id,
          nombre: body.nombre,
          disponible: body.disponible,
          color: body.color,
          stock: body.stock,
          stock_minimo: body.stock_minimo,
          unidad: body.unidad,
        },
        { onConflict: "id" },
      ));
    }

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
