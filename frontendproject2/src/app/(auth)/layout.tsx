import React from "react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <div className="relative min-h-screen flex flex-col">
        <div className="relative z-10"></div>
        <div
          className="absolute inset-0 -z-10 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')",
          }}
        >
          <div className="absolute inset-0 bg-black/70" />
        </div>
        <main className="flex-1 flex items-center justify-center p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
