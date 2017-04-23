module.exports.policies = {
  '*': ['wrapError'],
  ExecuteCmdController: {
    '*': ['wrapError', 'execCmdAuth'],
  },
};
