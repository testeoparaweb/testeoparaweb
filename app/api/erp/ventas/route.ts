import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";

type VentaPayload = {
  venta: Record<string, unknown>;
  items: Array<Record<string, unknown>>;
  movimientos: Array<Record<string, unknown>>;
  stock: Array<{ id: string; stock: number }>;
  stock_gustos?: Array<{ id: string; stock: number }>;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as VentaPayload;
    const supabase = createAdminClient();

    const venta = await supabase.from("ventas").insert(body.venta);
    if (venta.error) {
      return NextResponse.json({ error: venta.error.message }, { status: 500 });
    }

    const items = await supabase.from("items_venta").insert(body.items);
    if (items.error) {
      return NextResponse.json({ error: items.error.message }, { status: 500 });
    }

    const movimientos = await supabase
      .from("movimientos_stock")
      .insert(body.movimientos);
    if (movimientos.error) {
      return NextResponse.json(
        { error: movimientos.error.message },
        { status: 500 },
      );
    }

    const updates = await Promise.all(
      body.stock.map((item) =>
        supabase.from("productos").update({ stock: item.stock }).eq("id", item.id),
      ),
    );
    const stockError = updates.find((item) => item.error)?.error;
    if (stockError) {
      return NextResponse.json({ error: stockError.message }, { status: 500 });
    }

    if (body.stock_gustos?.length) {
      const flavorUpdates = await Promise.all(
        body.stock_gustos.map((item) =>
          supabase.from("gustos").update({ stock: item.stock }).eq("id", item.id),
        ),
      );
      const flavorError = flavorUpdates.find((item) => item.error)?.error;
      if (flavorError) {
        return NextResponse.json({ error: flavorError.message }, { status: 500 });
      }
    }

    const caja = await supabase.from("caja").insert({
      sucursal_id: body.venta.sucursal_id ?? null,
      tipo: "ingreso",
      concepto: `Venta ${body.venta.id}`,
      monto: body.venta.total ?? 0,
      metodo: body.venta.metodo ?? null,
      venta_id: body.venta.id,
    });
    if (caja.error) {
      return NextResponse.json({ error: caja.error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, venta: body.venta });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error desconocido" },
      { status: 500 },
    );
  }
}
