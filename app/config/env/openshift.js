

module.exports = {
  superSecret: process.env.SUPER_SECRET || 'SUPER_SECRET',
  execCmdKey: process.env.EXEC_CMD_KEY || 'key',
  port: process.env.PORT || '8080',
  ip: process.env.OPENSHIFT_DIY_IP,
  mailTransport: {
    host: 'smtp.sina.com',
    port: 465,
    secure: true,
    tls: {
      rejectUnauthorized: false,
    },
    auth: {
      user: 'test4code@sina.com',
      pass: 'Test4code;',
    },
  },
  mongo: {
    type: 'env',
    condition: 'host',
    host: 'OPENSHIFT_DIY_IP',
    post: 27017,
    dbName: 'noDbName',
    backupName: 'template',
    backupPassword: process.env.BACKUP_PASSWORD || 'template',
    backupDirPrefixes: './',
    backupInterval: 12 * 60 * 60 * 1000,
  },
  update: {
    ref: 'production',
  },
  bootstrap: [
    // 'webhookService'
  ],
};
