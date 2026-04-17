import { Providers } from "./providers";
import "./globals.css";

export const metadata = {
  title: "LOOKOUT - Connect, Study, Play",
  description: "A modern collaboration platform for teams and study groups",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
