this.board;
this.gameStatus;
this.chrono = 0;
this.chronoInterval;
this.firstClick = true;
this.difficulty;

// Main function, launch when load the page
async function main() {
    console.log('Starting main...');
    // Disable right-click
    document.addEventListener('contextmenu', event => event.preventDefault());

    this.difficulty = set_difficulty();
    this.gameStatus = 'Partie en cours...';
    this.board = await generate_board(this.difficulty.size);
    await show_board(this.board);
}

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
 * Show board in HTML Page
 * @param {Array<Array<Case>>} board 
 */
async function show_board(board) {
    const boardDiv = window.document.getElementById('board');
    boardDiv.innerHTML = '';

    // i = y; j = x
    for (let i = 0; i < board.length; i++) {
        let html = '<div class="row">';
        for (let j = 0; j < board[i].length; j++) {
            const cell = board[i][j];
            html += `<div class="case ${cell.is_revealed && !cell.is_bomb ? 'revealed' : ''} ${cell.is_revealed && cell.is_bomb ? 'revealed-bomb' : ''}" id="${j}-${i}">${cell.is_revealed ? (cell.is_bomb ? '💣' : (board[i][j].value !== 0 ? board[i][j].value : '.')) : (cell.is_flagged ? '👽' : '')}</div>`;
        }
        html += '</div>';
        boardDiv.innerHTML += html;
    }

    // for loop to add event listener to each case
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            const cellDiv = window.document.getElementById(`${j}-${i}`);
            cellDiv.addEventListener('mousedown', async (e) => {
                // first click start chrono and generate bombs
                if (this.firstClick) {
                    this.firstClick = false;
                    await generate_mines(this.board, this.difficulty.bombs_nb, {x: j, y: i});
                    chrono_handle();
                    this.chronoInterval = setInterval(chrono_handle, 1000);
                }

                if (e.button === 0) {
                    click_case(j, i);
                } else if (e.button === 2) {
                    flag_case(j, i);
                }
            });
        }
    }

    // show win or loose
    const statusDiv = window.document.getElementById('status');
    statusDiv.innerHTML = this.gameStatus;

}

/**
 * Generate board
 * @param {number} size 
 * @returns 
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

async function flag_case(x, y) {
    if (this.gameStatus !== 'Partie en cours...' || this.board[y][x].is_revealed) {
        return;
    }

    this.board[y][x].is_flagged = !this.board[y][x].is_flagged;

    await check_win(this.board); // Useless
    await show_board(this.board);
}

async function click_case(x, y) {
    if (this.gameStatus !== 'Partie en cours...' || this.board[y][x].is_revealed || this.board[y][x].is_flagged) {
        return;
    }

    this.board[y][x].is_revealed = true;

    // Check if click on a bomb (loose)
    if (this.board[y][x].is_bomb) {
        this.gameStatus = 'Partie perdue !';
        // Stop chrono
        clearInterval(this.chronoInterval);
        await show_board(this.board);
        return;
    }

    // Generate neighbours
    const nandb = await generate_neighbours(this.board, x, y);
    
    if (nandb.bombs === 0) {
        // Recursive call
        for (let i = 0; i < nandb.neighbours.length; i++) {
            const neighbour = nandb.neighbours[i];
            if (!neighbour.is_revealed) {
                await click_case(neighbour.x, neighbour.y);
            }
        }
    } else {
        this.board[y][x].value = nandb.bombs;
    }

    await check_win(this.board);
    await show_board(this.board);
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
        this.gameStatus = 'Partie gagnée !';
        clearInterval(this.chronoInterval);
    }
}

async function chrono_handle() {
    this.chrono++;
    const chronoDiv = window.document.getElementById('chrono');
    const hours = Math.floor(this.chrono / 3600);
    const minutes = Math.floor((this.chrono % 3600) / 60);
    const seconds = this.chrono % 60;
    if (minutes === 0) {
        chronoDiv.innerHTML = `${seconds < 10 ? `0${seconds}` : seconds}`;
    } else if (hours === 0) {
        chronoDiv.innerHTML = `${minutes < 10 ? `0${minutes}` : minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
    } else {
        chronoDiv.innerHTML = `${hours < 10 ? `0${hours}` : hours}:${minutes < 10 ? `0${minutes}` : minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
    }
}

function set_difficulty() {
    const select = window.document.getElementById('difficultySelect');
    const diff = select.options[select.selectedIndex].value;
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

async function restart_game() {
    this.gameStatus = 'Partie en cours...';
    this.firstClick = true;
    clearInterval(this.chronoInterval);
    this.chrono = 0;
    const chronoDiv = window.document.getElementById('chrono');
    chronoDiv.innerHTML = '';
    
    this.difficulty = set_difficulty();
    this.board = await generate_board(this.difficulty.size);
    await show_board(this.board);
}

main();