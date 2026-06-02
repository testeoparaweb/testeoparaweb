import { NextResponse } from "next/server";

import { findAuthUserByUsernameOrEmail } from "@/lib/auth/admin-users";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      usuario?: string;
      password?: string;
    };

    const usuario = body.usuario?.trim() ?? "";
    const password = body.password?.trim() ?? "";

    if (!usuario || !password) {
      return NextResponse.json(
        { error: "Completá usuario y contraseña" },
        { status: 400 },
      );
    }

    const user = await findAuthUserByUsernameOrEmail(usuario);

    if (!user?.email) {
      return NextResponse.json(
        { error: "Usuario o contraseña incorrectos" },
        { status: 401 },
      );
    }

    return NextResponse.json({ email: user.email });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error desconocido" },
      { status: 500 },
    );
  }
}
