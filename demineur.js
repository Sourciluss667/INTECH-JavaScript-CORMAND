class Case {
    value;
    is_bomb;
    is_revealed;
    is_flagged;
    x;
    y;
    constructor(x, y) {
        this.value = 0;
        this.is_bomb = false;
        this.is_revealed = false;
        this.is_flagged = false;
        this.x = x;
        this.y = y;
    }
}

/**
 * Generate board
 * @param {number} size 
 * @returns {Array<Array<Case>>}
 */
async function generate_board(size) {
    let board = [];
    for (let i = 0; i < size; i++) {
        board[i] = [];
        for (let j = 0; j < size; j++) {
            board[i][j] = new Case(j, i);
        }
    }
    return board;
}

/**
 * Generate mines in the board
 * @param {Array<Array<Case>>} board 
 * @param {number} nb_mines 
 */
async function generate_mines(board, nb_mines, not_this_case = {x: -1, y: -1}) {
    const yLen = board.length;
    const xLen = board[0].length;
    
    for (let i = 0; i < nb_mines; i++) {
        const y = Math.floor(Math.random() * yLen);
        const x = Math.floor(Math.random() * xLen);
        if (!board[y][x].is_bomb && !(x === not_this_case.x && y === not_this_case.y)) {
            board[y][x].is_bomb = true;
        } else {
            i--;
        } 
    }

    return board;
}

async function generate_neighbours(board, x, y) {
    const yLen = board.length;
    const xLen = board[0].length;
    let neighbours = [];
    let bombs = 0;
    for (let i = y - 1; i <= y + 1; i++) {
        for (let j = x - 1; j <= x + 1; j++) {
            if (i >= 0 && i < yLen && j >= 0 && j < xLen && !(i === y && j === x)) {
                neighbours.push(board[i][j]);
                if (board[i][j].is_bomb) {
                    bombs++;
                }
            }
        }
    }
    return {neighbours, bombs};
}

async function flag_case(board, x, y, gameStatus) {
    if (gameStatus !== 'Partie en cours...' || board[y][x].is_revealed) {
        return board;
    }

    board[y][x].is_flagged = !board[y][x].is_flagged;
    return board;
}

/**
 * 
 * @param {*} board 
 * @param {number} x 
 * @param {number} y 
 * @param {string} gameStatus 
 * @returns 
 */
async function click_case(board, x, y, gameStatus) {
    if (gameStatus !== 'Partie en cours...' || board[y][x].is_revealed || board[y][x].is_flagged) {
        return {board, gameStatus};
    }

    board[y][x].is_revealed = true;

    // Check if click on a bomb (loose)
    if (check_loose(board, x, y)) {
        return { board, gameStatus: 'Partie perdue !' };
    }

    // Generate neighbours
    const nandb = await generate_neighbours(board, x, y);
    
    if (nandb.bombs === 0) {
        // Recursive call
        for (let i = 0; i < nandb.neighbours.length; i++) {
            const neighbour = nandb.neighbours[i];
            if (!neighbour.is_revealed) {
                await click_case(board, neighbour.x, neighbour.y, gameStatus);
            }
        }
    } else {
        board[y][x].value = nandb.bombs;
    }

    // Check if win
    if (await check_win(board)) {
        return { board, gameStatus: 'Partie gagnée !' };
    } else {
        return {board, gameStatus};
    }
}

function check_loose(board, x, y) {
    return board[y][x].is_bomb;
}

async function check_win(board) {
    let win = true;
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            if (!board[i][j].is_revealed && !board[i][j].is_bomb) {
                win = false;
            }
        }
    }
    if (win) {
        return true;
    } else {
        return false;
    }
}

/**
 * Return size and number of bomb in the board
 * @param {string} diff 
 * @returns 
 */
function set_difficulty(diff) {
    let difficulty = {};
    switch (diff) {
        case '1':
            difficulty.size = 8;
            difficulty.bombs_nb = 10;
        break;
        case '2':
            difficulty.size = 16;
            difficulty.bombs_nb = 40;
        break;
        case '3':
            difficulty.size = 24;
            difficulty.bombs_nb = 99;
        break;
    }
    return difficulty;
}

// Check if run in NodeJS, in this case, export functions
if (typeof window === 'undefined') {
    module.exports = {
        generate_board,
        generate_mines,
        generate_neighbours,
        flag_case,
        click_case,
        check_win,
        check_loose,
        set_difficulty,
        Case
    };
}
