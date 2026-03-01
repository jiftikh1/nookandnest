import DesignerNav from "@/components/layout/DesignerNav";

export default function DesignerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FAF8F5" }}>
      <DesignerNav />
      <main className="pt-16">{children}</main>
    </div>
  );
}
