import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "NeonNexus Gaming Zone | Book Your Game",
  description: "Experience the ultimate gaming destination. Book Pickleball, Snooker, Bowling and more at NeonNexus Gaming Zones.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.className} bg-background min-h-screen`}>
        <AuthProvider>
          {children}
          <Toaster 
            position="top-right"
            toastOptions={{
              style: {
                background: '#0A0A0A',
                border: '1px solid rgba(0, 240, 255, 0.3)',
                color: '#EDEDED',
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
