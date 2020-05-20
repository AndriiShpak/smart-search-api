module.exports = function getEnvVar(varName) {
  let val = process.env[varName];
  if (!val) {
    console.error(`Error: ${varName} needs to be specified in your environmental variables!`);
    process.exit(-1);
  } else
    return val;
};
