import { Globe } from "lucide-react";

export function BrandLogo() {
  return (
    <div className="flex items-center">
      <Globe size={25} className="text-blue-600" />
      <span className="ml-2 font-bold text-2xl tracking-tight text-zinc-900">GEODash</span>
    </div>
  );
}
