module.exports.policies = {
  '*': ['wrapError', 'tokenAuth'],
  ExecuteCmdController: {
    '*': ['wrapError', 'execCmdAuth'],
  },
};
