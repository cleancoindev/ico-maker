const shouldFail = require('openzeppelin-solidity/test/helpers/shouldFail');
const time = require('openzeppelin-solidity/test/helpers/time');

const { shouldBehaveLikeTokenTimelock } = require('./behaviours/TokenTimelock.behaviour');

const BigNumber = web3.BigNumber;

const ERC20Mintable = artifacts.require('ERC20Mintable');
const BaseTimelock = artifacts.require('BaseTimelock');

contract('BaseTimelock', function ([_, minter, beneficiary]) {
  const amount = new BigNumber(100);

  beforeEach(async function () {
    this.token = await ERC20Mintable.new({ from: minter });
  });

  context('creating a valid timelock', function () {
    it('rejects a release time in the past', async function () {
      const pastReleaseTime = (await time.latest()) - time.duration.years(1);
      await shouldFail.reverting(
        BaseTimelock.new(this.token.address, beneficiary, pastReleaseTime)
      );
    });
  });

  context('as a Timelock', function () {
    beforeEach(async function () {
      this.releaseTime = (await time.latest()) + time.duration.years(1);
      this.timelock = await BaseTimelock.new(this.token.address, beneficiary, this.releaseTime);
      await this.token.mint(this.timelock.address, amount, { from: minter });
    });

    shouldBehaveLikeTokenTimelock([_, minter, beneficiary], amount);
  });
});