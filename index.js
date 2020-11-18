#!/usr/bin/env node

const hre = require('hardhat');

const { subtask } = require('hardhat/config');

const { TASK_NODE_SERVER_READY } = require('hardhat/builtin-tasks/task-names');

const { getUsers } = require('synthetix');

const { program } = require('commander');

program
	.name('fork')
	.version(require('./package.json').version)
	.arguments('[provider-url]')
	.description('', {
		providerUrl: 'URL of mainnet provider',
	})
	.action(async providerUrl => {
		if (!providerUrl) {
			throw Error('No provider given');
		}

		subtask(TASK_NODE_SERVER_READY).setAction(async ({ provider }, hre, runSuper) => {
			await runSuper();
			const snxUsers = getUsers({ network: 'mainnet' });

			await Promise.all(
				Object.values(snxUsers).map(({ address }) =>
					provider.request({
						method: 'hardhat_impersonateAccount',
						params: [address],
					}),
				),
			);
		});

		await hre.run('node', { fork: providerUrl });
	});

program.parse(process.argv);
