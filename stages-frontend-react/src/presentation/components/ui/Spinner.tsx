export function Spinner({ text='Chargement...' }: { text?: string }) {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mr-3" />
      <span className="text-gray-500 text-sm">{text}</span>
    </div>
  );
}