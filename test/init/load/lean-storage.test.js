process.env.NODE_ENV = 'test';

const _ = require('lodash');
const { test } =  require('ava');
const leanStorage = require('../../../src/init/load/lean-storage');
const My = require('../../../src/init/index');

let lift;
let webhook;
let webhook2;

test.before.cb((t) => {
  lift = new My({ alias: 'mKoa' })
    .use('config')
    .use('logger')
    .use('lean-storage')
    .use('service')
    .lift()
    .on('lifted', () => {
      return Webhook.remove({})
        .then(() => {
          t.end();
        });
    });
});

test('leanStorage#create', (t) => {
  return Webhook
    .create({
      name: 'test',
      description: 'desc',
    })
    .then((_webhook) => {
      t.true(!!_webhook._id);
      t.true(_webhook.name === 'test');
      t.true(_webhook.description === 'desc');

      webhook = _webhook;
    });
});

test('leanStorage#count', (t) => {
  return Webhook.count({})
    .then(function (nu) {
      t.true(nu === 1);
    });
});

test('leanStorage#find', (t) => {
  return Webhook.find({ name: 'test' }, 'name')
    .then(function (result) {
      t.true(result.length === 1);
      t.true(result[0].name === 'test');
      t.true(!result[0].description);
    });
});

test('leanStorage#findById', (t) => {
  return Webhook.findById(webhook._id)
    .then((_webhook) => {
      t.true(!!_webhook._id);
      t.true(_webhook._id === webhook._id);
      t.true(_webhook.name === 'test');
    });
});

test('leanStorage#findOne', (t) => {
  return Webhook
    .create({
      name: 'test2',
      description: 'desc2',
    })
    .then((_webhook) => {
      webhook2 = _webhook;
      return Webhook
        .findOne({ name: 'test2' }, 'name', {
          sort: {
            updatedAt: -1,
            createdAt: 1,
          }
        });
    })
    .then((_webhook) => {
      t.true(!!_webhook._id);
      t.true(_webhook.name === 'test2');
      t.true(_webhook._id === webhook2._id);
    });
});


test('leanStorage#update', (t) => {
  return Webhook
    .update({
      name: 'test100'
    }, {
      name: 'test'
    }, {
      upsert: true,
    })
    .then(() => {
      return Webhook.count({ name: 'test' });
    })
    .then((nu) => {
      t.true(nu === 2);
    })
    .then(() => {
      return Webhook
        .update({
          name: 'test2'
        }, {
          name: 'test'
        })
    })
    .then(() => {
      return Webhook.count({ name: 'test' });
    })
    .then((nu) => {
      t.true(nu === 3);
    })
    .then(() => {
      return Webhook
        .update({
          name: 'test'
        }, {
          name: 'test3'
        }, {
          multi: true,
        });
    })
    .then(() => {
      return Webhook.count({ name: 'test3' });
    })
    .then((nu) => {
      t.true(nu === 3);
    });
});

test('leanStorage#findByIdAndRemove', (t) => {
  return Webhook.findByIdAndRemove(webhook2._id)
    .then((_webhook) => {
      t.true(!!_webhook._id);
      t.true(_webhook._id === webhook2._id);
    });
});

test('leanStorage#remove', (t) => {
  return Webhook.remove({})
    .then(function () {
      return Webhook.find({});
    })
    .then((result) => {
      t.true(result.length === 0);
    });
});