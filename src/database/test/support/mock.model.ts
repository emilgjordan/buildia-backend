export abstract class MockModel<T> {
  protected abstract entityStub: T;

  constructor(createEntityData: T) {
    this.constructorSpy(createEntityData);
  }

  constructorSpy(_createEntityData): void {}

  findOne(): { exec: () => Promise<T> } {
    return { exec: (): Promise<T> => Promise.resolve(this.entityStub) };
  }

  find(): { exec: () => Promise<T[]> } {
    return { exec: (): Promise<T[]> => Promise.resolve([this.entityStub]) };
  }

  async save(): Promise<T> {
    return this.entityStub;
  }

  findOneAndUpdate(): { exec: () => Promise<T> } {
    return { exec: (): Promise<T> => Promise.resolve(this.entityStub) };
  }

  async deleteOne(): Promise<{ deletedCount?: number }> {
    return { deletedCount: 1 };
  }
}
