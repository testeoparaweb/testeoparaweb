import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";

type ProductoPayload = {
  id: string;
  nombre: string;
  categoria: string;
  precio: number;
  costo: number;
  stock: number;
  stock_minimo: number;
  unidad: string;
  imagen: string | null;
  max_gustos: number;
  consumo_gustos: number;
  stock_anterior?: number;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ProductoPayload;
    const supabase = createAdminClient();

    const categoria = await supabase.from("categorias").upsert({
      nombre: body.categoria,
    });
    if (categoria.error) {
      return NextResponse.json({ error: categoria.error.message }, { status: 500 });
    }

    const producto = await supabase.from("productos").upsert(
      {
        id: body.id,
        nombre: body.nombre,
        categoria: body.categoria,
        precio: body.precio,
        costo: body.costo,
        stock: body.stock,
        stock_minimo: body.stock_minimo,
        unidad: body.unidad,
        imagen: body.imagen,
        max_gustos: body.max_gustos,
        consumo_gustos: body.consumo_gustos,
        activo: true,
      },
      { onConflict: "id" },
    );
    if (producto.error) {
      return NextResponse.json({ error: producto.error.message }, { status: 500 });
    }

    if (
      typeof body.stock_anterior === "number" &&
      body.stock_anterior !== body.stock
    ) {
      const movimiento = await supabase.from("movimientos_stock").insert({
        producto_id: body.id,
        tipo: "ajuste",
        cantidad: body.stock - body.stock_anterior,
        nota: "Ajuste manual desde modulo stock",
      });

      if (movimiento.error) {
        return NextResponse.json(
          { error: movimiento.error.message },
          { status: 500 },
        );
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error desconocido" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const body = (await request.json()) as { id?: string };
    const id = body.id?.trim();

    if (!id) {
      return NextResponse.json(
        { error: "Falta el id del producto" },
        { status: 400 },
      );
    }

    const supabase = createAdminClient();
    const { error } = await supabase
      .from("productos")
      .update({ activo: false })
      .eq("id", id);

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
