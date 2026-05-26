import { NextResponse } from "next/server";

import { requireRoles } from "@/lib/auth/permissions";
import { createAdminClient } from "@/lib/supabase/admin";

type VentaPayload = {
  venta: Record<string, unknown>;
  items: Array<Record<string, unknown>>;
  movimientos: Array<Record<string, unknown>>;
  stock: Array<{ cantidad?: number; id: string; stock: number }>;
  stock_gustos?: Array<{ cantidad?: number; id: string; stock: number }>;
};

export async function POST(request: Request) {
  try {
    const permission = await requireRoles(["admin", "dueno", "empleado"]);
    if (!permission.ok) return permission.response;

    const body = (await request.json()) as VentaPayload;
    const pedido: VentaPayload = {
      ...body,
      venta: {
        ...body.venta,
        usuario_id: permission.user.id,
      },
      movimientos: Array.isArray(body.movimientos)
        ? body.movimientos.map((movimiento) => ({
            ...movimiento,
            usuario_id: permission.user.id,
          }))
        : [],
      stock: Array.isArray(body.stock) ? body.stock : [],
      stock_gustos: Array.isArray(body.stock_gustos) ? body.stock_gustos : [],
    };
    const saleId = String(pedido.venta?.id ?? "").trim();

    if (!saleId || !Array.isArray(pedido.items) || pedido.items.length === 0) {
      return NextResponse.json(
        { error: "El pedido no tiene datos suficientes para guardarse" },
        { status: 400 },
      );
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase.rpc("guardar_venta_transaccional", {
      pedido,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, resultado: data, venta: pedido.venta });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error desconocido" },
      { status: 500 },
    );
  }
}
