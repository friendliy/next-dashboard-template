import {lusitana} from "@/app/ui/fonts";
import "@/app/ui/global.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${lusitana.className} antialiased`}>{children}</body>
    </html>
  );
}