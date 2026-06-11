import "./globals.css";

export const metadata = {
  title: "BizSpeak Practice Room",
  description: "Business English speaking practice for professionals",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}