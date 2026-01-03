"use client";

import React from "react";
import { Toaster } from "sonner";
import { GoogleOAuthProvider } from "@react-oauth/google";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}>
      <section className="min-h-screen">
        {children}
        <Toaster position="top-right" richColors />
      </section>
    </GoogleOAuthProvider>
  );
}
