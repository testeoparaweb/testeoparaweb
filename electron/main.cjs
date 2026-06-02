/* eslint-disable @typescript-eslint/no-require-imports */
const { app, BrowserWindow, Menu, ipcMain, shell } = require("electron");
const { autoUpdater } = require("electron-updater");
const fs = require("node:fs");
const path = require("node:path");

const PORT = 5123;
const HOST = "127.0.0.1";
const DEFAULT_UPDATE_URL =
  "https://github.com/testeoparaweb/testeoparaweb/releases/latest/download";
let serverStarted = false;
let mainWindow;
let updaterStatus = {
  status: "idle",
  currentVersion: app.getVersion(),
};

const parseEnvFile = (filePath) => {
  if (!fs.existsSync(filePath)) return;

  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
};

const waitForServer = async (url, timeoutMs = 30000) => {
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok || response.status < 500) return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 350));
    }
  }

  throw new Error("No se pudo iniciar la app local");
};

const startProductionServer = async () => {
  if (serverStarted) return;
  serverStarted = true;

  const resourcesPath = process.resourcesPath;
  parseEnvFile(path.join(resourcesPath, ".env.local"));

  process.env.NODE_ENV = "production";
  process.env.PORT = String(PORT);
  process.env.HOSTNAME = HOST;

  const serverPath = path.join(
    resourcesPath,
    "app.asar.unpacked",
    ".next",
    "standalone",
    "server.js",
  );

  require(serverPath);
  await waitForServer(`http://${HOST}:${PORT}`);
};

const getAppUrl = () =>
  app.isPackaged
    ? `http://${HOST}:${PORT}`
    : process.env.ELECTRON_START_URL || "http://localhost:3000";

const fetchDesktopIcon = async (appUrl) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2500);

  try {
    const response = await fetch(`${appUrl}/api/erp/app-icon?size=512`, {
      cache: "no-store",
      signal: controller.signal,
    });

    if (!response.ok) return undefined;

    const iconPath = path.join(app.getPath("userData"), "app-icon.png");
    fs.writeFileSync(iconPath, Buffer.from(await response.arrayBuffer()));

    return iconPath;
  } catch {
    return undefined;
  } finally {
    clearTimeout(timeout);
  }
};

const sendUpdaterStatus = (nextStatus) => {
  updaterStatus = {
    ...updaterStatus,
    ...nextStatus,
    currentVersion: app.getVersion(),
  };
  mainWindow?.webContents.send("updater:status", updaterStatus);
};

const getUpdaterUrl = () =>
  process.env.ELECTRON_UPDATE_URL ||
  process.env.NEXT_PUBLIC_ELECTRON_UPDATE_URL ||
  DEFAULT_UPDATE_URL;

const setupAutoUpdater = () => {
  const updateUrl = getUpdaterUrl();

  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = true;

  if (!app.isPackaged) {
    sendUpdaterStatus({
      message: "Las actualizaciones se prueban en la app instalada.",
      status: "unsupported",
    });
    return;
  }

  autoUpdater.setFeedURL({
    provider: "generic",
    url: updateUrl,
  });

  autoUpdater.on("checking-for-update", () => {
    sendUpdaterStatus({ message: "Buscando actualización...", status: "checking" });
  });
  autoUpdater.on("update-available", (info) => {
    sendUpdaterStatus({
      message: `Versión ${info.version} disponible`,
      status: "available",
      version: info.version,
    });
  });
  autoUpdater.on("update-not-available", () => {
    sendUpdaterStatus({
      message: "La app está actualizada.",
      status: "not-available",
    });
  });
  autoUpdater.on("download-progress", (progress) => {
    sendUpdaterStatus({
      message: `Descargando ${Math.round(progress.percent || 0)}%`,
      progress: Math.round(progress.percent || 0),
      status: "downloading",
    });
  });
  autoUpdater.on("update-downloaded", (info) => {
    sendUpdaterStatus({
      message: "Actualización lista para instalar",
      progress: 100,
      status: "downloaded",
      version: info.version,
    });
  });
  autoUpdater.on("error", (error) => {
    sendUpdaterStatus({
      message: error instanceof Error ? error.message : "No se pudo actualizar",
      status: "error",
    });
  });

  setTimeout(() => {
    autoUpdater.checkForUpdates().catch((error) => {
      sendUpdaterStatus({
        message: error instanceof Error ? error.message : "No se pudo buscar actualización",
        status: "error",
      });
    });
  }, 2500);
};

ipcMain.handle("updater:get-status", () => updaterStatus);
ipcMain.handle("updater:check", async () => {
  if (!app.isPackaged || !getUpdaterUrl()) {
    return updaterStatus;
  }

  await autoUpdater.checkForUpdates();
  return updaterStatus;
});
ipcMain.handle("updater:download", async () => {
  await autoUpdater.downloadUpdate();
  return updaterStatus;
});
ipcMain.handle("updater:install", () => {
  autoUpdater.quitAndInstall(false, true);
});

const createWindow = async () => {
  if (app.isPackaged) {
    await startProductionServer();
  }

  const appUrl = getAppUrl();
  const iconPath = await fetchDesktopIcon(appUrl);
  const win = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1100,
    minHeight: 720,
    backgroundColor: "#070809",
    title: "Caja Heladeria",
    autoHideMenuBar: true,
    ...(iconPath ? { icon: iconPath } : {}),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, "preload.cjs"),
      sandbox: true,
    },
  });
  mainWindow = win;
  win.setMenuBarVisibility(false);
  win.removeMenu();

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  if (app.isPackaged) {
    await win.loadURL(appUrl);
  } else {
    await win.loadURL(appUrl);
    win.webContents.openDevTools({ mode: "detach" });
  }

  setupAutoUpdater();
};

app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
  void createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      void createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
