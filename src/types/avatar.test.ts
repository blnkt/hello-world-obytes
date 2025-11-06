import type {
  AvatarCollectionSet,
  AvatarPart,
  AvatarPartType,
  EquippedAvatarParts,
} from './avatar';

describe('Avatar Types', () => {
  describe('AvatarPartType', () => {
    it('should accept valid part types', () => {
      const headType: AvatarPartType = 'head';
      const torsoType: AvatarPartType = 'torso';
      const legsType: AvatarPartType = 'legs';

      expect(headType).toBe('head');
      expect(torsoType).toBe('torso');
      expect(legsType).toBe('legs');
    });
  });

  describe('AvatarPart', () => {
    it('should have required fields', () => {
      const part: AvatarPart = {
        id: 'test_head',
        name: 'Test Head',
        description: 'A test head part',
        partType: 'head',
        assetPath: 'assets/avatar/heads/test_head.png',
        setId: 'test_set',
      };

      expect(part.id).toBe('test_head');
      expect(part.name).toBe('Test Head');
      expect(part.description).toBe('A test head part');
      expect(part.partType).toBe('head');
      expect(part.assetPath).toBe('assets/avatar/heads/test_head.png');
      expect(part.setId).toBe('test_set');
    });
  });

  describe('AvatarCollectionSet', () => {
    it('should extend CollectionSet structure with avatarPartId', () => {
      const set: AvatarCollectionSet = {
        id: 'warrior_helmet_set',
        name: 'Warrior Helmet Set',
        description: 'Unlock a warrior helmet',
        category: 'trade_goods',
        items: [],
        bonuses: [],
        avatarPartId: 'warrior_helmet',
      };

      expect(set.id).toBe('warrior_helmet_set');
      expect(set.name).toBe('Warrior Helmet Set');
      expect(set.avatarPartId).toBe('warrior_helmet');
    });
  });

  describe('EquippedAvatarParts', () => {
    it('should have headId, torsoId, and legsId fields', () => {
      const equipped: EquippedAvatarParts = {
        headId: 'default_head',
        torsoId: 'default_torso',
        legsId: 'default_legs',
      };

      expect(equipped.headId).toBe('default_head');
      expect(equipped.torsoId).toBe('default_torso');
      expect(equipped.legsId).toBe('default_legs');
    });
  });
});
