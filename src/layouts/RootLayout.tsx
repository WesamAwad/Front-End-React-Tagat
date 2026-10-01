import { Outlet } from "react-router-dom";
import { Header, Footer } from "../components/layout";
import { AIChatWidget } from "../features/ai/AIChatWidget";

export default function RootLayout() {
  return (
    <div className="flex min-h-screen flex-col text-primary">
      <Header />

      <main className="w-full grow">
        <Outlet />
      </main>

      <Footer />
      <AIChatWidget />
    </div>
  );
}
