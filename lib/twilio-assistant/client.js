const twilio = require('twilio');
const os = require('os');
const path = require('path');
const _ = require('lodash');
const inquirer = require('inquirer');
const { _askCredential } = require('./initConfig');

module.exports = async (profileName) => {
  try {
    const twilioDir = path.resolve(os.homedir(),'.twilio/config.json');
    let config = require(twilioDir);
    let f_profile = await _.findIndex(config, { profileName: profileName });

    if (f_profile >= 0) {
      return await new twilio(config[f_profile].accountSID, config[f_profile].authToken);
    } else {
      return await inquirer.prompt([{
        type: 'confirm',
        name: 'newcreate',
        default: true,
        message: 'The Credentials name [' + profileName + '] does not exist. Would you like to create it?'
      }]).then(async (answer) => {
        if (answer.newcreate) {
          let config  = await _askCredential(profileName);
          let f_profile = await _.findIndex(config, { profileName: profileName });
          if (f_profile >= 0) {
            return await new twilio(config[f_profile].accountSID, config[f_profile].authToken);
          }
        } else {
          process.exit();
        }
      });
    }
  } catch(e) {
    if (e.code == 'MODULE_NOT_FOUND') {
      console.log(`Oops! We did not find the "${profileName}" Credentials name in the System Home Directory.`);

      const config = await _askCredential('default');
      const f_profile = _.findIndex(config, { profileName: 'default' });
      if (f_profile >= 0) {
        return new twilio(config[f_profile].accountSID, config[f_profile].authToken);
      }
    } else {
      console.log(`Oops! Invalid credentials for the "${profileName}" Credentials name.`);
      process.exit();
    }
  }
};
