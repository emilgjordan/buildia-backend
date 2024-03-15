export function mockModelFactory<T>(entityStub: T) {
  return class {
    constructor(createEntityData: T) {
      Object.assign(this, createEntityData);
      this.constructorSpy(createEntityData);
    }

    constructorSpy(_createEntityData): void {}

    static findOne(): { exec: () => Promise<T> } {
      return { exec: jest.fn().mockResolvedValue(entityStub) };
    }

    static find(): { exec: () => Promise<T[]> } {
      return { exec: jest.fn().mockResolvedValue([entityStub]) };
    }

    save = jest.fn().mockResolvedValue(entityStub);

    static findOneAndUpdate(): { exec: () => Promise<T> } {
      return { exec: jest.fn().mockResolvedValue(entityStub) };
    }

    deleteOne = jest.fn().mockResolvedValue({ deletedCount: 1 });
  };
}
