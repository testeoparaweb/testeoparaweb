import { NextResponse } from "next/server";

import {
  listAllAuthUsers,
  mapManagedUser,
} from "@/lib/auth/admin-users";
import { getSessionUser, type UserRole } from "@/lib/auth/user";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const currentUser = await getSessionUser();

  if (!currentUser) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  if (currentUser.role !== "admin" && currentUser.role !== "dueno") {
    return NextResponse.json(
      { error: "Solo admin y dueño pueden ver usuarios" },
      { status: 403 },
    );
  }

  try {
    const users = await listAllAuthUsers();
    return NextResponse.json({ usuarios: users.map(mapManagedUser) });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error desconocido" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const currentUser = await getSessionUser();

  if (!currentUser) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  if (currentUser.role !== "admin" && currentUser.role !== "dueno") {
    return NextResponse.json(
      { error: "Solo admin y dueño pueden crear usuarios" },
      { status: 403 },
    );
  }

  try {
    const body = (await request.json()) as {
      nombre?: string;
      usuario?: string;
      email?: string;
      password?: string;
      role?: UserRole;
    };

    const nombre = body.nombre?.trim() ?? "";
    const usuario = body.usuario?.trim() ?? "";
    const email = body.email?.trim().toLowerCase() ?? "";
    const password = body.password ?? "";
    const role = body.role;

    if (role !== "dueno" && role !== "empleado") {
      return NextResponse.json(
        { error: "Elegí un rol válido" },
        { status: 400 },
      );
    }

    if (!nombre || !usuario || !email || !password) {
      return NextResponse.json(
        { error: "Completá nombre, usuario, email y contraseña" },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 6 caracteres" },
        { status: 400 },
      );
    }

    const users = await listAllAuthUsers();
    const normalizedUsername = usuario.toLowerCase();

    const usernameExists = users.some(
      (user) =>
        String(user.user_metadata?.username ?? "")
          .trim()
          .toLowerCase() === normalizedUsername,
    );
    if (usernameExists) {
      return NextResponse.json(
        { error: "Ese usuario ya existe" },
        { status: 409 },
      );
    }

    const emailExists = users.some(
      (user) => user.email?.trim().toLowerCase() === email,
    );
    if (emailExists) {
      return NextResponse.json(
        { error: "Ese email ya existe" },
        { status: 409 },
      );
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name: nombre,
        username: usuario,
        role,
      },
    });

    if (error || !data.user) {
      return NextResponse.json(
        { error: error?.message ?? "No se pudo crear el usuario" },
        { status: 500 },
      );
    }

    return NextResponse.json({ usuario: mapManagedUser(data.user) });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error desconocido" },
      { status: 500 },
    );
  }
}
