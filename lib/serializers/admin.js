const BaseSerializer = require('./base');
const { serializer: { attributes, transform } } = require('./utils/user');

class AdminSerializer extends BaseSerializer {
  constructor() {
    super('admin', {
      attributes,
      transform({ user }) {
        return transform(user);
      }
    });
  }
}

module.exports = AdminSerializer;