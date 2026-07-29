type Variant =
  | "attente"
  | "accepte"
  | "refuse"
  | "active"
  | "blue"
  | "purple"
  | "green"
  | "red";

const cls: Record<Variant, string> = {
  attente: "badge-attente",
  accepte: "badge-accepte",
  refuse: "badge-refuse",
  active: "badge-active",
  blue: "inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700",
  purple:
    "inline-flex px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-700",
  green:
    "inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700",
  red: "inline-flex px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700",
};

export function Badge({
  variant = "active",
  children,
  className = "",
}: {
  variant?: Variant;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={cls[variant] + (className ? " " + className : "")}>
      {children}
    </span>
  );
}
