#!/usr/bin/env node
require('dotenv').config();

const chalk = require('chalk');
const prompts = require('prompts');
const Mongo = require('../dist/context/mongo');
const $security = require('../dist/context/security')({});

function generateRootUser(answers = {}) {
  const questions = [
    {
      type: 'text',
      name: 'username',
      message: 'Please enter a username?',
      initial: answers.username || '',
    },
    {
      type: 'text',
      name: 'email',
      message: 'Please enter a email?',
      initial: answers.email || '',
    },
    {
      type: 'invisible',
      name: 'password',
      message: 'Please enter a password?',
    },
    {
      type: 'invisible',
      name: 'password_confirm',
      message: 'Please confirm the password',
    },
  ];

  console.info(chalk.blue('🚀 Please enter the details of the Root user you want to create! 🚀 '));

  return Mongo({}).then($mongo => {
    if (!$mongo) {
      console.error(chalk.red('Unable to connect to the database'));
      // eslint-disable-next-line no-process-exit
      process.exit(0);
    }

    return prompts(questions).then(response => {
      const { username, email, password, password_confirm } = response;

      return $mongo.$db
        .collection('users')
        .find({ $or: [{ _id: 'root' }, { username: new RegExp(`^${username}$`, 'iu') }, { email: new RegExp(`^${email}$`, 'iu') }] })
        .toArray()
        .then(rootUserExists => {
          if (rootUserExists && rootUserExists.length > 0) {
            const [user] = rootUserExists;

            let error;
            if (user.username === username) error = 'Error: Username already in use';
            if (user.email === email) error = 'Error: Email already in use';

            console.error(chalk.red(error || 'Error: Root user already exists.'));
            // eslint-disable-next-line no-process-exit
            process.exit(0);
          }

          if (password_confirm !== password) {
            console.error(chalk.red('Error: Passwords do not match.'));

            return generateRootUser({ username, email });
          }

          return $security.encrypt(password).then(hashedPassword => {
            const rootUser = {
              _id: 'root',
              username,
              email,
              password: hashedPassword,
              roles: ['root'],
              createdAt: new Date(),
              updatedAt: new Date(),
            };

            return $mongo.$save('users', rootUser).then(() => {
              // eslint-disable-next-line no-console
              console.log(chalk.greenBright('✨  Successfully created user ✨ '));
              // eslint-disable-next-line no-process-exit
              process.exit(0);
            });
          });
        });
    });
  });
}

generateRootUser();

module.exports = generateRootUser;
