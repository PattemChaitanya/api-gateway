class BaseRepository {
  constructor() {
    this.collectionName = '';
  }

  async findAll(page = 1, limitCount = 10) {
    throw new Error('Method not implemented');
  }

  async findById(id) {
    throw new Error('Method not implemented');
  }

  async findByQuery(query) {
    throw new Error('Method not implemented');
  }

  async create(data) {
    throw new Error('Method not implemented');
  }

  async update(id, data) {
    throw new Error('Method not implemented');
  }

  async delete(id) {
    throw new Error('Method not implemented');
  }
}

module.exports = BaseRepository; 