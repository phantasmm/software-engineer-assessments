const { default: resultStore } = require("./resultsService");

const store = resultStore();

function getResult(id) {
  return store.getResult(id);
}

function newResult(result) {
  store.newResult(result);
  return {};
}

function reset() {
  store.reset();
}

function scoreboard() {
  let result = {};
  const eletionMap = new Map();
  let totalVote = 0;
  for (let constituency of store.getAll()){
    let winnerParty = constituency.partyResults[0];
    if(winnerParty) {
      setEletionMap(eletionMap, winnerParty);
      totalVote += winnerParty.votes;
    }

    for(let party of constituency.partyResults.slice(1)) {
      setEletionMap(eletionMap, party);
      totalVote += party.votes;

      if(party.votes > winnerParty.votes){
        winnerParty = party
      }
    }

    //update seat
    if(winnerParty) {
      eletionMap.get(winnerParty.party).seat += 1;
    }
  }
  let totalSeats = 0;
  for (let [key, value] of eletionMap){
    value.share = Math.round(value.votes / totalVote * 10000)/100
    totalSeats += value.seat;
    //find winner of eletion
    if (value.seat >= 325){
      result.winner = key;
    }
  }
  result.partyResults = Object.fromEntries(eletionMap);
  result.totalSeats = totalSeats;
  return result;
}

function setEletionMap(map, party){
  let selectedParty = map.get(party.party);
    if (selectedParty){
      selectedParty.votes += party.votes;
    } else{
      map.set(party.party,{
        votes: party.votes,
        seat: 0
      })
    }
}

module.exports = { getResult, newResult, reset, scoreboard };
