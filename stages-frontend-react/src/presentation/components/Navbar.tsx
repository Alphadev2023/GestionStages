export function Navbar({ title }: { title: string }) {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6 ml-64">
      <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
    </header>
  );
}