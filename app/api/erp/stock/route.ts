import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      producto_id: string;
      stock: number;
      movimiento: Record<string, unknown>;
    };
    const supabase = createAdminClient();

    const [producto, movimiento] = await Promise.all([
      supabase
        .from("productos")
        .update({ stock: body.stock })
        .eq("id", body.producto_id),
      supabase.from("movimientos_stock").insert(body.movimiento),
    ]);

    const error = producto.error || movimiento.error;
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
