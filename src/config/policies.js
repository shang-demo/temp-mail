module.exports.policies = {
  '*': ['wrapError'],
  ExecuteCmdController: {
    '*': ['wrapError', 'execCmdAuth'],
    deployVersion: ['wrapError'],
  },
};
