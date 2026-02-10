import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NEYOTA - Ensemble, faisons vivre nos territoires",
  description: "Plateforme de mise en relation entre porteurs de projets et talents locaux. 100% gratuit • 100% local • 100% impact",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>
        {children}
      </body>
    </html>
  );
}
