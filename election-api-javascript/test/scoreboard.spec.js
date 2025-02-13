const fs = require("fs");
const request = require("supertest");
const { default: expressServer, resetScores } = require("../src/server");

const resultsSamplesPath = "./test/resources/sample-election-results";

function loadAndPostResultFile(server, num) {
  const fileNumber = new String(parseInt(num, 10)).padStart(3, "0");
  const result = fs.readFileSync(
    `${resultsSamplesPath}/result${fileNumber}.json`,
  );
  return server.post("/result").send(JSON.parse(result));
}

async function loadResults(server, quantity) {
  const results = [];
  for (let count = 0; count < quantity; count += 1) {
    results.push(await loadAndPostResultFile(server, count + 1));
  }
  return results;
}

function fetchScoreboard(server) {
  return server.get("/scoreboard");
}

describe("Scoreboard Tests", () => {
  const server = request(expressServer);

  beforeEach(() => {
    resetScores();
  });

  test("first 5", async () => {
    await loadResults(server, 5);
    const scoreboard = await fetchScoreboard(server);
    expect(scoreboard).not.toBeNull();
    // assert LD  have won 1 seat
    // assert LAB have won 4 seats
    // assert no winner
    expect(scoreboard.body.partyResults.LD.seat).toBe(1);
    expect(scoreboard.body.partyResults.LAB.seat).toBe(4);
    expect(scoreboard.body.winner).toBeUndefined();
  });

  test("first 100", async () => {
    await loadResults(server, 100);
    const scoreboard = await fetchScoreboard(server);
    expect(scoreboard).not.toBeNull();
    // assert LD  have won 12 seats
    // assert LAB have won 56 seats
    // assert CON have won 31 seats
    // assert SGP have won 0  seats
    // assert no winner
    expect(scoreboard.body.partyResults.LD.seat).toBe(12);
    expect(scoreboard.body.partyResults.LAB.seat).toBe(56);
    expect(scoreboard.body.partyResults.CON.seat).toBe(31);
    expect(scoreboard.body.partyResults.SGP.seat).toBe(0);
    expect(scoreboard.body.winner).toBeUndefined();
    // Bonus Task (total votes):
    // assert SGP have 1071 votes in total
    expect(scoreboard.body.partyResults.SGP.votes).toBe(1071);
  });

  test("first 554", async () => {
    await loadResults(server, 554);
    const scoreboard = await fetchScoreboard(server);
    expect(scoreboard).not.toBeNull();
    // assert LD   have won 52  seats
    // assert LAB  have won 325 seats
    // assert CON  have won 167 seats
    // assert IKHH have won 1   seats
    // assert winner is LAB
    expect(scoreboard.body.partyResults.LD.seat).toBe(52);
    expect(scoreboard.body.partyResults.LAB.seat).toBe(325);
    expect(scoreboard.body.partyResults.CON.seat).toBe(167);
    expect(scoreboard.body.partyResults.IKHH.seat).toBe(1);
    expect(scoreboard.body.winner).toBe("LAB");
    // Bonus Task (total votes):
    // assert IKHH have 18739 votes in total
    expect(scoreboard.body.partyResults.IKHH.votes).toBe(18739);
  }, 10000);

  test("test all results", async () => {
    await loadResults(server, 650);
    const scoreboard = await fetchScoreboard(server);
    expect(scoreboard).not.toBeNull();
    // assert LD   have won 62  seats
    // assert LAB  have won 349 seats
    // assert CON  have won 210 seats
    // assert SDLP have won 3   seats
    // assert winner is LAB
    // assert 650 seats counted
    expect(scoreboard.body.partyResults.LD.seat).toBe(62);
    expect(scoreboard.body.partyResults.LAB.seat).toBe(349);
    expect(scoreboard.body.partyResults.CON.seat).toBe(210);
    expect(scoreboard.body.partyResults.SDLP.seat).toBe(3);
    expect(scoreboard.body.winner).toBe("LAB");
    expect(scoreboard.body.totalSeats).toBe(650);
    // Bonus Task (total votes):
    // assert SDLP have 125626 votes in total
    expect(scoreboard.body.partyResults.SDLP.votes).toBe(125626);
  }, 15000);
});
