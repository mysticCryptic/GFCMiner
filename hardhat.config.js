require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-etherscan")
let secret = require("./secret.json")
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.15",

  paths: {
    artifacts: './src/artifacts',
  },

  networks: {
    BSC: {
      url: secret.url,
      accounts: [secret.key],
    }
  },
  etherscan: {
    apiKey: secret.api,
  },
};
