import { Outlet } from "react-router-dom";
import { Header, Footer } from "../components/layout";

export default function RootLayout() {
  return (
    <div className="flex min-h-screen flex-col text-primary">
      <Header />

      <main className="w-full grow">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}
