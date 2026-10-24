import { AnimeStatus as PrismaStatus } from '@prisma/client';
import { AnimeStatus as FEStatus } from '@/types/anime';

// FE → Prisma
export function toPrismaStatus(status: FEStatus): PrismaStatus {
  switch (status) {
    case 'plan_to_watch': return 'PLANNING';
    case 'watching': return 'WATCHING';
    case 'completed': return 'COMPLETED';
    case 'on_hold': return 'ON_HOLD';
    case 'dropped': return 'DROPPED';
    default: return 'PLANNING';
  }
}

// Prisma → FE
export function toFEStatus(status: PrismaStatus): FEStatus {
  switch (status) {
    case 'PLANNING': return 'plan_to_watch';
    case 'WATCHING': return 'watching';
    case 'COMPLETED': return 'completed';
    case 'ON_HOLD': return 'on_hold';
    case 'DROPPED': return 'dropped';
    default: return 'plan_to_watch';
  }
}