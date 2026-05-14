import { Snowflake } from "lucide-react";

export function AuthShell({
  children,
}: {
  children: React.ReactNode;
  eyebrow?: string;
  title?: string;
  description?: string;
}) {
  return (
    <div className="min-h-screen bg-[#070809] text-zinc-100">
      <div className="mx-auto flex min-h-screen w-full max-w-[1680px] items-center justify-center px-4 py-8 md:px-8">
        <main className="w-full max-w-md">
          <div className="mb-6 flex items-center justify-center">
            <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-[#0d0f10] px-4 py-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-cyan-300 text-zinc-950">
                <Snowflake className="size-5" />
              </div>
              <p className="font-semibold text-zinc-100">
                Heladeria Facundo&apos;s
              </p>
            </div>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
