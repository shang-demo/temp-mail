const My = require('../init/index');

const updateFile = process.argv[2];

function update() {
  const lift = new My({ alias: 'mKoa' })
    .use('config')
    .use('logger')
    .use('errors')
    .use('model')
    .use('service')
    .use('controller')
    .use('policy')
    .use('bootstrap')
    .use('koa')
    .lift();

  return lift
    .on('lifted', () => {
      logger.info('lifted');
      logger.info('updateFile: ', updateFile);
      Promise
        .try(() =>
          /* eslint-disable global-require */
          /* eslint-disable import/no-dynamic-require */
           require(`./${updateFile}`)())
        .then((data) => {
          lift.emit('update-success', data);
        })
        .catch((e) => {
          lift.emit('update-error', e);
        });
    })
    .on('lowered', () => {
      logger.info('lowered');
      // eslint-disable-next-line no-unused-expressions
      lift.server && lift.server.close(() => {
        logger.info('close');
      });
    })
    .on('update-error', (e) => {
      logger.info('error: ', e);
      lift.lower();
    })
    .on('update-success', (data) => {
      logger.info('success: ', data);
      lift.lower();
    });
}

update();
