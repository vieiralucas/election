const Election = artifacts.require('./Election.sol')

contract('Election', (accounts) => {
  it('should initialize two candidates with correct values', async () => {
    const election = await Election.deployed()

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
})
