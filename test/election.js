const Election = artifacts.require('./Election.sol')

contract('Election', (accounts) => {
  let election
  beforeEach(async () => {
    election = await Election.deployed()
  })

  it('should initialize two candidates with correct values', async () => {
    const candidatesCount = (await election.candidatesCount()).toNumber()
    expect(candidatesCount).to.be.equal(2)

    const candidate1 = await election.candidates(1)
    expect(candidate1.id.toNumber()).to.be.equal(1)
    expect(candidate1.name).to.be.equal('Candidate 1')
    expect(candidate1.voteCount.toNumber()).to.be.equal(0)

    const candidate2 = await election.candidates(2)
    expect(candidate2.id.toNumber()).to.be.equal(2)
    expect(candidate2.name).to.be.equal('Candidate 2')
    expect(candidate2.voteCount.toNumber()).to.be.equal(0)
  })

  describe('.vote', () => {
    it('should increment candidate voteCount by 1', async () => {
      let candidate1 = await election.candidates(1)

      expect(candidate1.voteCount.toNumber()).to.be.equal(0)

      const receipt = await election.vote(1, { from: accounts[0] })
      candidate1 = await election.candidates(1)
      expect(candidate1.voteCount.toNumber()).to.be.equal(1)

      // check that candidate2 is remains unvoted
      const candidate2 = await election.candidates(2)
      expect(candidate2.voteCount.toNumber()).to.be.equal(0)

      // check that voter was marked as voted
      expect(await election.voters(accounts[0])).to.be.true

      // check that a VoteEvent was emitted
      expect(receipt.logs).to.have.lengthOf(1)
      expect(receipt.logs[0].event).to.equal('VoteEvent')
      expect(receipt.logs[0].args._candidateId.toNumber()).to.be.equal(1)
    })

    it('should prevent voting twice', async () => {
      const prevC1 = await election.candidates(1)
      const prevC2 = await election.candidates(2)

      try {
        await election.vote(1, { from: accounts[0] })
        assert.fail()
      } catch (err) {
        expect(err.message).to.contains('revert')
        candidate1 = await election.candidates(1)
        expect(candidate1.voteCount.toNumber()).to.be.equal(1)
      }

      // check that voteCounts remains unchanged
      const c1 = await election.candidates(1)
      expect(c1.voteCount.toNumber()).to.be.equal(prevC1.voteCount.toNumber())
      const c2 = await election.candidates(2)
      expect(c2.voteCount.toNumber()).to.be.equal(prevC2.voteCount.toNumber())
    })

    it('should prevent voting in invalid candidates', async () => {
      const prevC1 = await election.candidates(1)
      const prevC2 = await election.candidates(2)

      try {
        await election.vote(0, { from: accounts[1] })
        assert.fail()
      } catch (err) {
        expect(err.message).to.contains('revert')
      }

      try {
        await election.vote(3, { from: accounts[1] })
        assert.fail()
      } catch (err) {
        expect(err.message).to.contains('revert')
      }

      // check that voteCounts remains unchanged
      const c1 = await election.candidates(1)
      expect(c1.voteCount.toNumber()).to.be.equal(prevC1.voteCount.toNumber())
      const c2 = await election.candidates(2)
      expect(c2.voteCount.toNumber()).to.be.equal(prevC2.voteCount.toNumber())
    })
  })
})
