process.on('uncaughtException', (err) => {
  // eslint-disable-next-line no-console
  console.error('uncaughtException:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, p) => {
  // eslint-disable-next-line no-console
  console.log('Unhandled Rejection at:', p, 'reason:', reason);
  process.exit(1);
});
