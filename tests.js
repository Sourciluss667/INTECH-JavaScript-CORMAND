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
    boards[0] = await d.generate_mines(boards[0], difficulty[0].bombs_nb);
    boards[1] = await d.generate_mines(boards[1], difficulty[1].bombs_nb);
    boards[2] = await d.generate_mines(boards[2], difficulty[2].bombs_nb);
    for (let i = 0; i < boards.length; i++) {
        assert.equal(boards[i].length, difficulty[i].size, "generate_mines() is not working");
        let bombs_nb = 0;
        for (let j = 0; j < boards[i].length; j++) {
            assert.equal(boards[i][j].length, difficulty[i].size, "generate_mines() is not working");
            for (let k = 0; k < boards[i][j].length; k++) {
                if (boards[i][j][k].is_bomb) {
                    bombs_nb++;
                }
            }
        }
        assert.equal(bombs_nb, difficulty[i].bombs_nb, "generate_mines() is not working");
    }
    console.log("generate_mines() is working...");

    // Check if 'generate_neighbours()' is working
    for (let i = 0; i < boards.length; i++) {
        for (let j = 0; j < boards[i].length; j++) {
            for (let k = 0; k < boards[i][j].length; k++) {
                const n = await d.generate_neighbours(boards[i], k, j);
                if (n.neighbours.length < 8) {
                    if (n.neighbours.length < 5) {
                        assert.equal(n.neighbours.length, 3, "generate_neighbours() is not working");
                    } else {
                        assert.equal(n.neighbours.length, 5, "generate_neighbours() is not working");
                    }
                } else {
                    assert.equal(n.neighbours.length, 8, "generate_neighbours() is not working");
                }
                let bombsCount = 0;
                for (let l = 0; l < n.neighbours.length; l++) {
                    // Check if neighbours have good x and y
                    if (!(n.neighbours[l].x >= k - 1 && n.neighbours[l].x <= k + 1 && n.neighbours[l].y >= j - 1 && n.neighbours[l].y <= j + 1)) {
                        assert.fail("generate_neighbours() is not working");
                    }

                    if (n.neighbours[l].is_bomb) {
                        bombsCount++;
                    }
                }
                assert.equal(bombsCount, n.bombs, "generate_neighbours() is not working");
            }
        }
    }
    console.log("generate_neighbours() is working...");

    // Check if 'flag_case()' is working
    for (let i = 0; i < boards.length; i++) {
        const yLen = boards[i].length;
        const xLen = boards[i][0].length;
        const y = Math.floor(Math.random() * yLen);
        const x = Math.floor(Math.random() * xLen);

        // Normal case
        let flaggedBoard = await d.flag_case(boards[i], x, y, 'Partie en cours...');
        assert.equal(flaggedBoard[y][x].is_flagged, true, "flag_case() is not working");
        flaggedBoard = await d.flag_case(flaggedBoard, x, y, 'Partie en cours...');
        assert.equal(flaggedBoard[y][x].is_flagged, false, "flag_case() is not working");

        // When the game is over
        flaggedBoard = await d.flag_case(boards[i], x, y, 'Partie gagnée !');
        assert.equal(flaggedBoard[y][x].is_flagged, false, "flag_case() is not working");
        flaggedBoard = await d.flag_case(boards[i], x, y, 'Partie perdue !');
        assert.equal(flaggedBoard[y][x].is_flagged, false, "flag_case() is not working");

        // When the case is revealed
        boards[i][y][x].is_revealed = true;
        flaggedBoard = await d.flag_case(boards[i], x, y, 'Partie en cours...');
        assert.equal(flaggedBoard[y][x].is_flagged, false, "flag_case() is not working");
    }
    console.log("flag_case() is working...");

    // Check if 'click_case()' is working
    for (let i = 0; i < boards.length; i++) {
        const yLen = boards[i].length;
        const xLen = boards[i][0].length;
        const y = Math.floor(Math.random() * yLen);
        const x = Math.floor(Math.random() * xLen);

        // Normal case
        boards[i][y][x].is_bomb = false;
        boards[i][y][x].is_flagged = false;
        boards[i][y][x].is_revealed = false;
        let res = await d.click_case(boards[i], x, y, 'Partie en cours...');
        assert.equal(res.board[y][x].is_revealed, true, "click_case() is not working");
        assert.equal(res.gameStatus, 'Partie en cours...', "click_case() is not working");

        // Recursive check
        if (res.board[y][x].value === 0) {
            const temp = await d.generate_neighbours(res.board, x, y);
            for (let j = 0; j < temp.neighbours.length; j++) {
                if (!temp.neighbours[j].is_bomb) {
                    assert.equal(temp.neighbours[j].is_revealed, true, "click_case() is not working");
                }
            }
        }
        
        // Bomb case
        boards[i][y][x].is_bomb = true;
        boards[i][y][x].is_flagged = false;
        boards[i][y][x].is_revealed = false;
        res = await d.click_case(boards[i], x, y, 'Partie en cours...');
        assert.equal(res.board[y][x].is_revealed, true, "click_case() is not working");
        assert.equal(res.gameStatus, 'Partie perdue !', "click_case() is not working");

        // Revealed case
        boards[i][y][x].is_bomb = false;
        boards[i][y][x].is_flagged = false;
        boards[i][y][x].is_revealed = true;
        res = await d.click_case(boards[i], x, y, 'Partie en cours...');
        assert.equal(res.board[y][x].is_revealed, true, "click_case() is not working");
        assert.equal(res.gameStatus, 'Partie en cours...', "click_case() is not working");

        // Flag case
        boards[i][y][x].is_bomb = false;
        boards[i][y][x].is_flagged = true;
        boards[i][y][x].is_revealed = false;
        res = await d.click_case(boards[i], x, y, 'Partie en cours...');
        assert.equal(res.board[y][x].is_revealed, false, "click_case() is not working");
        assert.equal(res.gameStatus, 'Partie en cours...', "click_case() is not working");
    }
    console.log("click_case() is working...");

    // Check if 'check_loose()' is working
    for (let i = 0; i < boards.length; i++) {
        const yLen = boards[i].length;
        const xLen = boards[i][0].length;
        const y = Math.floor(Math.random() * yLen);
        const x = Math.floor(Math.random() * xLen);

        boards[i][y][x].is_bomb = true;
        assert.equal(await d.check_loose(boards[i], x, y), true, "check_loose() is not working");
        boards[i][y][x].is_bomb = false;
        assert.equal(await d.check_loose(boards[i], x, y), false, "check_loose() is not working");
    }
    console.log("check_loose() is working...");

    // Check if 'check_win()' is working
    for (let i = 0; i < boards.length; i++) {
        // Not win
        let res = await d.check_win(boards[i]);
        assert.equal(res, false, "check_win() is not working");

        // Win game
        for (let y = 0; y < boards[i].length; y++) {
            for (let x = 0; x < boards[i][y].length; x++) {
                if (!boards[i][y][x].is_bomb) {
                    boards[i][y][x].is_flagged = false;
                    boards[i][y][x].is_revealed = true;
                }
            }
        }
        res = await d.check_win(boards[i]);
        assert.equal(res, true, "check_win() is not working");
    }
    console.log("check_win() is working...");

}

tests();
