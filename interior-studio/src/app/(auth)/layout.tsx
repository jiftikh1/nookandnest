export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#FAF8F5" }}>
      {children}
    </div>
  );
}
