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

    const select = window.document.getElementById('difficultySelect');
    const diff = select.options[select.selectedIndex].value;
    this.difficulty = set_difficulty(diff);
    this.gameStatus = 'Partie en cours...';
    this.board = await generate_board(this.difficulty.size);
    await show_board(this.board);
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
                    this.board = await generate_mines(this.board, this.difficulty.bombs_nb, {x: j, y: i});
                    await chrono_handle();
                    this.chronoInterval = setInterval(chrono_handle, 1000);
                }

                if (e.button === 0) {
                    const temp = await click_case(this.board, j, i, this.gameStatus);
                    this.board = temp.board;
                    this.gameStatus = temp.gameStatus;
                    await show_board(this.board);
                } else if (e.button === 2) {
                    this.board = await flag_case(this.board, j, i, this.gameStatus);
                    await show_board(this.board);
                }

                if (this.gameStatus !== 'Partie en cours...') {
                    clearInterval(this.chronoInterval);
                }
            });
        }
    }

    // show win or loose
    const statusDiv = window.document.getElementById('status');
    statusDiv.innerHTML = this.gameStatus;

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

async function restart_game() {
    this.gameStatus = 'Partie en cours...';
    this.firstClick = true;
    clearInterval(this.chronoInterval);
    this.chrono = 0;
    const chronoDiv = window.document.getElementById('chrono');
    chronoDiv.innerHTML = '';
    
    const select = window.document.getElementById('difficultySelect');
    const diff = select.options[select.selectedIndex].value;
    this.difficulty = set_difficulty(diff);
    this.board = await generate_board(this.difficulty.size);
    await show_board(this.board);
}

main();