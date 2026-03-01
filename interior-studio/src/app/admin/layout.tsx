import AdminNav from "@/components/layout/AdminNav";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FAF8F5" }}>
      <AdminNav />
      <main style={{ paddingTop: "64px" }}>{children}</main>
    </div>
  );
}
