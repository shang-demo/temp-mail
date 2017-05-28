process.env.NODE_ENV = 'test';

const _ = require('lodash');
const { test } =  require('ava');
const My = require('../../../src/init/index');

let lift;

test.before.cb((t) => {
  lift = new My({ alias: 'mKoa' })
    .use('config')
    .use('logger')
    .use('model')
    .lift()
    .on('lifted', () => {
      return User.remove({})
        .then(() => {
          t.end();
        });
    });
});

test.after(() => {
  return User.remove({});
});


test('mongoose#create', (t) => {
  return User
    .create({
      username: 'username',
    })
    .then((_user) => {
      t.true(!!_user._id);
      t.true(_user.username === 'username');
    });
});
