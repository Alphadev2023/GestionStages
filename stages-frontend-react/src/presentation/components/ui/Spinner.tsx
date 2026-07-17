export function Spinner({ text = 'Chargement...' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 border-4 border-gray-200 rounded-full" />
        <div className="absolute inset-0 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
      <p className="text-sm text-gray-500 animate-pulse">{text}</p>
    </div>
  );
}

export function SpinnerOverlay({ text = 'Traitement en cours...' }: { text?: string }) {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-3">
      <div className="relative w-14 h-14">
        <div className="absolute inset-0 border-4 border-gray-200 rounded-full" />
        <div className="absolute inset-0 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
      <p className="text-sm font-medium text-gray-700">{text}</p>
    </div>
  );
}