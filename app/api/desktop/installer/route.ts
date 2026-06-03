import { existsSync, statSync } from "node:fs";
import { createReadStream } from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";

import { NextResponse } from "next/server";

import packageJson from "@/package.json";
import { getSessionUser } from "@/lib/auth/user";

const installerFileName = `Caja Heladeria Setup ${packageJson.version}.exe`;
const fallbackInstallerUrl =
  process.env.DESKTOP_INSTALLER_URL ||
  process.env.NEXT_PUBLIC_DESKTOP_INSTALLER_URL ||
  `https://github.com/testeoparaweb/testeoparaweb/releases/latest/download/${encodeURIComponent(
    installerFileName,
  )}`;
const localInstallerDir =
  process.env.DESKTOP_INSTALLER_DIR ||
  path.join(/*turbopackIgnore: true*/ process.cwd(), ["dist", "electron"].join("-"));

export async function GET() {
  const user = await getSessionUser();

  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const installerPath = path.join(localInstallerDir, installerFileName);

  if (!existsSync(installerPath)) {
    return NextResponse.redirect(fallbackInstallerUrl);
  }

  const fileSize = statSync(installerPath).size;
  const stream = createReadStream(installerPath);

  return new Response(Readable.toWeb(stream) as BodyInit, {
    headers: {
      "Cache-Control": "private, no-store",
      "Content-Disposition": `attachment; filename="${installerFileName}"`,
      "Content-Length": String(fileSize),
      "Content-Type": "application/vnd.microsoft.portable-executable",
    },
  });
}
