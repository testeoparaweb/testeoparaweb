import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const supabase = createAdminClient();

    const [
      productos,
      gustosConStock,
      metodosPago,
      ventas,
      itemsVenta,
      gastos,
      gastosHistorial,
      tandasGustos,
      empleados,
      asistencias,
    ] = await Promise.all([
      supabase
        .from("productos")
        .select("id,nombre,categoria,precio,costo,stock,stock_minimo,unidad,imagen,max_gustos,consumo_gustos")
        .eq("activo", true)
        .order("categoria", { ascending: true })
        .order("nombre", { ascending: true }),
      supabase
        .from("gustos")
        .select("id,nombre,disponible,color,categoria,stock,stock_minimo,unidad")
        .eq("disponible", true)
        .order("categoria", { ascending: true })
        .order("nombre", { ascending: true }),
      supabase
        .from("metodos_pago")
        .select("nombre")
        .eq("activo", true)
        .order("nombre", { ascending: true }),
      supabase
        .from("ventas")
        .select("id,cliente,productos,metodo,hora,total,subtotal,descuento,creado")
        .order("creado", { ascending: false })
        .range(0, 9999),
      supabase
        .from("items_venta")
        .select("id,venta_id,producto,cantidad,costo,gustos,creado")
        .order("creado", { ascending: false })
        .range(0, 9999),
      supabase
        .from("gastos")
        .select("clave,nombre,categoria,monto")
        .eq("activo", true)
        .order("orden", { ascending: true }),
      supabase
        .from("gastos_historial")
        .select("id,fecha_desde,total,gastos,creado")
        .order("fecha_desde", { ascending: true })
        .limit(1000),
      supabase
        .from("tandas_gustos")
        .select("id,gusto_id,gusto,kilos,porciones_cargadas,stock_sistema_al_cerrar,rendimiento_sugerido,estado,creado,cerrado")
        .order("creado", { ascending: false })
        .limit(1000),
      supabase
        .from("empleados")
        .select("id,nombre,rol,turno,sector,estado")
        .eq("activo", true)
        .order("nombre", { ascending: true }),
      supabase
        .from("asistencias")
        .select("id,empleado_id,empleado,tipo,turno,creado")
        .order("creado", { ascending: false })
        .limit(50),
    ]);

    const gustos =
      gustosConStock.error?.code === "42703" ||
      gustosConStock.error?.code === "PGRST204"
        ? await supabase
            .from("gustos")
            .select("id,nombre,disponible,color,stock,stock_minimo,unidad")
            .eq("disponible", true)
            .order("nombre", { ascending: true })
        : gustosConStock;

    const gustosCompat =
      gustos.error?.code === "42703" || gustos.error?.code === "PGRST204"
        ? await supabase
            .from("gustos")
            .select("id,nombre,disponible,color")
            .eq("disponible", true)
            .order("nombre", { ascending: true })
        : gustos;

    const historialError =
      gastosHistorial.error?.code === "42P01" ||
      gastosHistorial.error?.code === "PGRST205"
        ? null
        : gastosHistorial.error;

    const tandasError =
      tandasGustos.error?.code === "42P01" ||
      tandasGustos.error?.code === "PGRST205"
        ? null
        : tandasGustos.error;

    const error =
      productos.error ||
      gustosCompat.error ||
      metodosPago.error ||
      ventas.error ||
      itemsVenta.error ||
      gastos.error ||
      historialError ||
      tandasError ||
      empleados.error ||
      asistencias.error;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      productos: productos.data ?? [],
      gustos: gustosCompat.data ?? [],
      metodos_pago: metodosPago.data ?? [],
      ventas: ventas.data ?? [],
      items_venta: itemsVenta.data ?? [],
      gastos: gastos.data ?? [],
      gastos_historial: gastosHistorial.error ? [] : gastosHistorial.data ?? [],
      tandas_gustos: tandasGustos.error ? [] : tandasGustos.data ?? [],
      empleados: empleados.data ?? [],
      asistencias: asistencias.data ?? [],
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error desconocido" },
      { status: 500 },
    );
  }
}
