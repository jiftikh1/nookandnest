import ClientNav from "@/components/layout/ClientNav";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FAF8F5" }}>
      <ClientNav />
      <main style={{ paddingTop: "64px" }}>{children}</main>
    </div>
  );
}
