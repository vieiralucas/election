// SPDX-License-Identifier: MIT
pragma solidity ^0.5.16;

contract Election {
  struct Candidate {
    uint id;
    string name;
    uint voteCount;
  }

  mapping(address => bool) public voters;

  mapping(uint => Candidate) public candidates;
  uint public candidatesCount;

  constructor() public {
    addCandidate("Candidate 1");
    addCandidate("Candidate 2");
  }

  event VoteEvent (uint indexed _candidateId);

  function addCandidate(string memory _name) private {
    candidatesCount++;
    candidates[candidatesCount] = Candidate(candidatesCount, _name, 0);
  }

  function vote(uint _candidateId) public {
    require(!voters[msg.sender]);

    require(_candidateId > 0 && _candidateId <= candidatesCount);

    voters[msg.sender] = true;
    candidates[_candidateId].voteCount++;

    emit VoteEvent(_candidateId);
  }
}
