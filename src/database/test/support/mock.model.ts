export function mockModelFactory<T>(entityStub: T) {
  return class {
    constructor(createEntityData: T) {
      Object.assign(this, createEntityData);
      this.constructorSpy(createEntityData);
    }

    constructorSpy(_createEntityData): void {}

    static findOne = jest
      .fn()
      .mockReturnValue({ exec: () => Promise.resolve(entityStub) });

    static find = jest
      .fn()
      .mockReturnValue({ exec: () => Promise.resolve([entityStub]) });

    save(): Promise<T> {
      return Promise.resolve(entityStub);
    }

    static findOneAndUpdate = jest
      .fn()
      .mockReturnValue({ exec: () => Promise.resolve(entityStub) });

    static deleteOne = jest.fn().mockResolvedValue({ deletedCount: 1 });
  };
}
