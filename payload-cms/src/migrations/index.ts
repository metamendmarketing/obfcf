import * as migration_20260707_202909 from './20260707_202909';

export const migrations = [
  {
    up: migration_20260707_202909.up,
    down: migration_20260707_202909.down,
    name: '20260707_202909'
  },
];
