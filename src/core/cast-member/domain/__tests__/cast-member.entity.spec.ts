import { CastMember, CastMemberId, CastMemberType } from '@/core/cast-member/domain/cast-member.entity';

describe('CastMember Unit Tests', () => {
  beforeEach(() => {
    CastMember.prototype.validate = jest.fn().mockImplementation(CastMember.prototype.validate);
  });

  describe('constructor', () => {
    test('should create a cast member with default values', () => {
      const castMember = new CastMember({
        name: 'John Doe',
        type: CastMemberType.ACTOR,
      });
      expect(castMember.id).toBeInstanceOf(CastMemberId);
      expect(castMember.name).toBe('John Doe');
      expect(castMember.type).toBe(CastMemberType.ACTOR);
      expect(castMember.created_at).toBeInstanceOf(Date);
    });

    test('should create a cast member with all values', () => {
      const created_at = new Date();
      const castMember = new CastMember({
        name: 'John Doe',
        type: CastMemberType.ACTOR,
        created_at,
      });
      expect(castMember.id).toBeInstanceOf(CastMemberId);
      expect(castMember.name).toBe('John Doe');
      expect(castMember.type).toBe(CastMemberType.ACTOR);
      expect(castMember.created_at).toBe(created_at);
    });

    test('should create a cast member with name and type as ACTOR', () => {
      const castMember = new CastMember({
        name: 'John Doe',
        type: CastMemberType.ACTOR,
      });
      expect(castMember.id).toBeInstanceOf(CastMemberId);
      expect(castMember.name).toBe('John Doe');
      expect(castMember.type).toBe(CastMemberType.ACTOR);
      expect(castMember.created_at).toBeInstanceOf(Date);
    });

    test('should create a cast member with name and type as DIRECTOR', () => {
      const castMember = new CastMember({
        name: 'Jane Doe',
        type: CastMemberType.DIRECTOR,
      });
      expect(castMember.id).toBeInstanceOf(CastMemberId);
      expect(castMember.name).toBe('Jane Doe');
      expect(castMember.type).toBe(CastMemberType.DIRECTOR);
      expect(castMember.created_at).toBeInstanceOf(Date);
    });
  });

  describe('id field', () => {
    const arrange = [{ id: null }, { id: undefined }, { id: new CastMemberId() }];
    test.each(arrange)('when id is %j', ({ id }) => {
      const castMember = new CastMember({
        id: id as any,
        name: 'John Doe',
        type: CastMemberType.ACTOR,
      });
      expect(castMember.id).toBeInstanceOf(CastMemberId);
      if (id instanceof CastMemberId) {
        expect(castMember.id).toBe(id);
      }
    });
  });

  describe('create command', () => {
    test('should create a cast member with default values', () => {
      const castMember = CastMember.create({
        name: 'John Doe',
        type: CastMemberType.ACTOR,
      });
      expect(castMember.id).toBeInstanceOf(CastMemberId);
      expect(castMember.name).toBe('John Doe');
      expect(castMember.type).toBe(CastMemberType.ACTOR);
      expect(castMember.created_at).toBeInstanceOf(Date);
      expect(CastMember.prototype.validate).toHaveBeenCalledTimes(1);
      expect(castMember.notification.hasErrors()).toBeFalsy();
    });

    test('should create a cast member with all values', () => {
      const created_at = new Date();
      const castMember = CastMember.create({
        name: 'John Doe',
        type: CastMemberType.ACTOR,
        created_at,
      });
      expect(castMember.id).toBeInstanceOf(CastMemberId);
      expect(castMember.name).toBe('John Doe');
      expect(castMember.type).toBe(CastMemberType.ACTOR);
      expect(castMember.created_at).toBe(created_at);
      expect(CastMember.prototype.validate).toHaveBeenCalledTimes(1);
      expect(castMember.notification.hasErrors()).toBeFalsy();
    });

    test('should create a cast member with name and type ACTOR', () => {
      const castMember = CastMember.create({
        name: 'John Doe',
        type: CastMemberType.ACTOR,
      });
      expect(castMember.id).toBeInstanceOf(CastMemberId);
      expect(castMember.name).toBe('John Doe');
      expect(castMember.type).toBe(CastMemberType.ACTOR);
      expect(castMember.created_at).toBeInstanceOf(Date);
      expect(CastMember.prototype.validate).toHaveBeenCalledTimes(1);
      expect(castMember.notification.hasErrors()).toBeFalsy();
    });

    test('should create a cast member with name and type DIRECTOR', () => {
      const castMember = CastMember.create({
        name: 'Jane Doe',
        type: CastMemberType.DIRECTOR,
      });
      expect(castMember.id).toBeInstanceOf(CastMemberId);
      expect(castMember.name).toBe('Jane Doe');
      expect(castMember.type).toBe(CastMemberType.DIRECTOR);
      expect(castMember.created_at).toBeInstanceOf(Date);
      expect(CastMember.prototype.validate).toHaveBeenCalledTimes(1);
      expect(castMember.notification.hasErrors()).toBeFalsy();
    });
  });

  describe('actions', () => {
    test('should change name', () => {
      const castMember = CastMember.create({
        name: 'John Doe',
        type: CastMemberType.ACTOR,
      });
      castMember.changeName('name-updated');
      expect(castMember.name).toBe('name-updated');
      expect(CastMember.prototype.validate).toHaveBeenCalledTimes(2);
      expect(castMember.notification.hasErrors()).toBeFalsy();
    });

    test('should change type', () => {
      const castMember = CastMember.create({
        name: 'John Doe',
        type: CastMemberType.ACTOR,
      });
      castMember.changeType(CastMemberType.DIRECTOR);
      expect(castMember.type).toBe(CastMemberType.DIRECTOR);
      expect(CastMember.prototype.validate).toHaveBeenCalledTimes(2);
      expect(castMember.notification.hasErrors()).toBeFalsy();
    });
  });
});

describe('CastMember Validator', () => {
  describe('create command', () => {
    test('should an invalid cast member with name property', () => {
      const castMember = CastMember.create({ name: 'x'.repeat(256), type: CastMemberType.ACTOR });
      expect(castMember.notification.hasErrors()).toBeTruthy();
      expect(castMember.notification).notificationContainsErrorMessages([
        {
          name: ['name must be shorter than or equal to 255 characters'],
        },
      ]);
    });

    test('should an invalid cast member with type property', () => {
      const castMember = CastMember.create({ name: 'John Doe', type: 3 as any });
      expect(castMember.notification.hasErrors()).toBeTruthy();
      expect(castMember.notification).notificationContainsErrorMessages([
        {
          type: ['type must be one of the following values: 1, 2'],
        },
      ]);
    });

    test('should an invalid cast member with name and type property', () => {
      const castMember = CastMember.create({ name: 'x'.repeat(256), type: 3 as any });
      expect(castMember.notification.hasErrors()).toBeTruthy();
      expect(castMember.notification).notificationContainsErrorMessages([
        {
          name: ['name must be shorter than or equal to 255 characters'],
          type: ['type must be one of the following values: 1, 2'],
        },
      ]);
    });
  });

  describe('changeName method', () => {
    test('should an invalid cast member with name property', () => {
      const castMember = CastMember.create({ name: 'John Doe', type: CastMemberType.ACTOR });
      castMember.changeName('x'.repeat(256));
      expect(castMember.notification.hasErrors()).toBeTruthy();
      expect(castMember.notification).notificationContainsErrorMessages([
        {
          name: ['name must be shorter than or equal to 255 characters'],
        },
      ]);
    });
  });

  describe('changeType method', () => {
    test('should an invalid cast member with type property', () => {
      const castMember = CastMember.create({ name: 'John Doe', type: CastMemberType.ACTOR });
      castMember.changeType(3 as any);
      expect(castMember.notification.hasErrors()).toBeTruthy();
      expect(castMember.notification).notificationContainsErrorMessages([
        {
          type: ['type must be one of the following values: 1, 2'],
        },
      ]);
    });
  });
});
