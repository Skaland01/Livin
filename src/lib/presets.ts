import { RoomPreset } from './types';

export const roomPresets: Record<RoomPreset, string[]> = {
  Bathroom: [
    'Clean toilet bowl and seat',
    'Wipe down sink and counter',
    'Clean mirror',
    'Scrub shower/bathtub',
    'Mop floor',
    'Empty trash',
    'Restock toilet paper',
    'Clean towel rack',
  ],
  Kitchen: [
    'Wash dishes and put away',
    'Clean countertops',
    'Wipe down appliances',
    'Clean microwave',
    'Sweep and mop floor',
    'Empty trash and recycling',
    'Clean sink',
    'Wipe down cabinet fronts',
    'Organize pantry',
  ],
  LivingRoom: [
    'Dust surfaces and shelves',
    'Vacuum/sweep floor',
    'Fluff and arrange cushions',
    'Clean coffee table',
    'Dust TV and electronics',
    'Organize magazines/books',
    'Wipe down windowsills',
    'Empty trash',
  ],
  Hallway: [
    'Sweep and mop floor',
    'Dust baseboards',
    'Clean light switches',
    'Organize shoes/coats',
    'Wipe down walls',
    'Clean mirrors',
    'Empty trash',
  ],
  Custom: [],
};

export type { RoomPreset };
