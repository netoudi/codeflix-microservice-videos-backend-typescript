import { InMemoryStorage } from '@/core/shared/infra/storage/in-memory.storage';

describe('InMemoryStorage', () => {
  let storage: InMemoryStorage;

  beforeEach(() => {
    storage = new InMemoryStorage();
  });

  it('should throw error when file not found', async () => {
    await expect(storage.get('invalid-id')).rejects.toThrow(new Error('File invalid-id not found'));
  });

  describe('store', () => {
    it('should store data in the storage', async () => {
      const id = 'test-id';
      const data = Buffer.from('test data');
      const mime_type = 'text/plain';
      await storage.store({ id, data, mime_type });
      const storedData = storage['storage'].get(id);
      expect(storedData).toEqual({ id, data, mime_type });
    });
  });

  describe('get', () => {
    it('should return the stored data', async () => {
      const id = 'test-id';
      const data = Buffer.from('test data');
      const mime_type = 'text/plain';
      await storage.store({ id, data, mime_type });
      const result = await storage.get(id);
      expect(result).toEqual({ id, data, mime_type });
    });
  });
});
