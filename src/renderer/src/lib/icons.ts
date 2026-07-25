import {
  Dumbbell,
  BookOpen,
  Code,
  Coffee,
  Music,
  Paintbrush,
  Heart,
  Bike,
  Utensils,
  Moon,
  Sun,
  Droplet,
  Flame,
  Brain,
  Camera,
  PenTool,
  Gamepad2,
  Plane,
  ShoppingCart,
  Wallet,
  GraduationCap,
  Guitar,
  Trees,
  Dog,
  type LucideIcon
} from 'lucide-react'

export const ICON_MAP: Record<string, LucideIcon> = {
  dumbbell: Dumbbell,
  'book-open': BookOpen,
  code: Code,
  coffee: Coffee,
  music: Music,
  paintbrush: Paintbrush,
  heart: Heart,
  bike: Bike,
  utensils: Utensils,
  moon: Moon,
  sun: Sun,
  droplet: Droplet,
  flame: Flame,
  brain: Brain,
  camera: Camera,
  'pen-tool': PenTool,
  gamepad: Gamepad2,
  plane: Plane,
  'shopping-cart': ShoppingCart,
  wallet: Wallet,
  'graduation-cap': GraduationCap,
  guitar: Guitar,
  trees: Trees,
  dog: Dog
}

export const ICON_NAMES = Object.keys(ICON_MAP)

export function getActivityIcon(name: string | null): LucideIcon | null {
  if (!name) return null
  return ICON_MAP[name] ?? null
}
