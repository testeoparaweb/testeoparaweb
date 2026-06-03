import { existsSync, statSync } from "node:fs";
import { createReadStream } from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";

import { NextResponse } from "next/server";

import packageJson from "@/package.json";
import { getSessionUser } from "@/lib/auth/user";

const installerFileName = `Caja Heladeria Setup ${packageJson.version}.exe`;
const remoteInstallerUrl =
  process.env.DESKTOP_INSTALLER_URL ||
  process.env.NEXT_PUBLIC_DESKTOP_INSTALLER_URL ||
  "";
const localInstallerDirs = [
  process.env.DESKTOP_INSTALLER_DIR,
  path.join(/*turbopackIgnore: true*/ process.cwd(), ["dist", "electron"].join("-")),
  path.join(/*turbopackIgnore: true*/ process.cwd(), "public", "downloads"),
  path.join(
    /*turbopackIgnore: true*/ process.cwd(),
    ".next",
    "standalone",
    ["dist", "electron"].join("-"),
  ),
].filter((dir): dir is string => Boolean(dir));

const attachmentHeaders = (fileSize?: number | string | null) => {
  const headers = new Headers({
    "Cache-Control": "private, no-store",
    "Content-Disposition": `attachment; filename="${installerFileName}"`,
    "Content-Type": "application/vnd.microsoft.portable-executable",
  });

  if (fileSize) {
    headers.set("Content-Length", String(fileSize));
  }

  return headers;
};

const findLocalInstallerPath = () => {
  for (const dir of localInstallerDirs) {
    const installerPath = path.join(dir, installerFileName);
    if (existsSync(installerPath)) return installerPath;
  }

  return null;
};

const streamRemoteInstaller = async () => {
  if (!remoteInstallerUrl) return null;

  const response = await fetch(remoteInstallerUrl, { cache: "no-store" }).catch(
    () => null,
  );

  if (!response?.ok || !response.body) {
    return null;
  }

  return new Response(response.body, {
    headers: attachmentHeaders(response.headers.get("content-length")),
  });
};

export async function GET() {
  const user = await getSessionUser();

  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const installerPath = findLocalInstallerPath();

  if (installerPath) {
    const fileSize = statSync(installerPath).size;
    const stream = createReadStream(installerPath);

    return new Response(Readable.toWeb(stream) as BodyInit, {
      headers: attachmentHeaders(fileSize),
    });
  }

  const remoteInstaller = await streamRemoteInstaller();

  if (remoteInstaller) {
    return remoteInstaller;
  }

  return NextResponse.json(
    {
      error:
        "El instalador no esta publicado. Subi el .exe al servidor o configura DESKTOP_INSTALLER_URL con una URL directa de descarga.",
    },
    { status: 404 },
  );
}
