"use client";

import {
  Star,
  Footprints,
  Car,
  BedDouble,
  MapPin,
  HeartHandshake,
  Wallet,
  ShieldCheck,
  Utensils,
  Clock,
  Flame,
  CalendarDays,
  Wifi,
  Snowflake,
  Tv,
  ShowerHead,
  ParkingCircle,
  ConciergeBell,
  WashingMachine,
  ArrowUpFromLine,
  Video,
  Droplets,
  Bath,
  type LucideIcon,
} from "lucide-react";

export const ICONS: Record<string, LucideIcon> = {
  Star,
  Footprints,
  Car,
  BedDouble,
  MapPin,
  HeartHandshake,
  Wallet,
  ShieldCheck,
  Utensils,
  Clock,
  Flame,
  CalendarDays,
  Wifi,
  AC: Snowflake,
  TV: Tv,
  Geyser: ShowerHead,
  HotWater: Droplets,
  Parking: ParkingCircle,
  RoomService: ConciergeBell,
  Laundry: WashingMachine,
  Lift: ArrowUpFromLine,
  PowerBackup: Video,
  CCTV: Video,
  AttachedBath: Bath,
};

export function getIcon(name: string): LucideIcon {
  return ICONS[name] ?? Star;
}
