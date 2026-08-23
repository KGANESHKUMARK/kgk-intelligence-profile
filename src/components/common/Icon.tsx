import {
  Activity,
  Boxes,
  Bot,
  BrainCircuit,
  Cloud,
  Coffee,
  Container,
  Database,
  FileWarning,
  Landmark,
  Layers,
  LayoutGrid,
  Lock,
  Network,
  PlugZap,
  Radio,
  Server,
  ShieldAlert,
  Sparkles,
  Users,
  type LucideIcon,
} from 'lucide-react';

/**
 * Explicit icon registry. Data files reference icons by string name; keeping the
 * map explicit means tree-shaking still works (no dynamic lucide imports).
 */
const registry: Record<string, LucideIcon> = {
  Activity,
  Boxes,
  Bot,
  BrainCircuit,
  Cloud,
  Coffee,
  Container,
  Database,
  FileWarning,
  Landmark,
  Layers,
  LayoutGrid,
  Lock,
  Network,
  PlugZap,
  Radio,
  Server,
  ShieldAlert,
  Sparkles,
  Users,
};

export function Icon({
  name,
  size = 16,
  className,
  strokeWidth = 1.75,
}: {
  name: string;
  size?: number;
  className?: string;
  strokeWidth?: number;
}) {
  const Cmp = registry[name] ?? Activity;
  return <Cmp size={size} className={className} strokeWidth={strokeWidth} aria-hidden="true" />;
}
