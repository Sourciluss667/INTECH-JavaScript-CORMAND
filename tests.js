const d = require('./demineur.js');
const { assert } = require("chai");

async function tests() {
    // Check if 'set_difficulty()' is working
    const difficulty = [];
    difficulty.push(d.set_difficulty('1'));
    difficulty.push(d.set_difficulty('2'));
    difficulty.push(d.set_difficulty('3'));
    assert.deepEqual(difficulty[0], {size: 8, bombs_nb: 10}, "set_difficulty() is not working");
    assert.deepEqual(difficulty[1], {size: 16, bombs_nb: 40}, "set_difficulty() is not working");
    assert.deepEqual(difficulty[2], {size: 24, bombs_nb: 99}, "set_difficulty() is not working");
    console.log("set_difficulty() is working...");

    // Check if 'generate_board()' is working
    const boards = [];
    boards.push(await d.generate_board(difficulty[0].size));
    boards.push(await d.generate_board(difficulty[1].size));
    boards.push(await d.generate_board(difficulty[2].size));
    for (let i = 0; i < boards.length; i++) {
        assert.equal(boards[i].length, difficulty[i].size, "generate_board() is not working");
        for (let j = 0; j < boards[i].length; j++) {
            assert.equal(boards[i][j].length, difficulty[i].size, "generate_board() is not working");
            for (let k = 0; k < boards[i][j].length; k++) {
                assert.deepEqual(boards[i][j][k], new d.Case(k, j), "generate_board() is not working");
            }
        }
    }
    console.log("generate_board() is working...");

    // Check if 'generate_mines()' is working
    
}

tests();
