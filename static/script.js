document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('puzzle-form');
    const showOnPuzzle = document.getElementsByClassName("hidden");
    const reset_btn = document.getElementById('reset');
    const analyseL_btn = document.getElementById('analyseL');
    const analyseC_btn = document.getElementById('analyseC');
    const puzzle_btn = document.getElementById('puzzle-btn');
    let originalFEN, originalMoves, originalURL, updatedFEN;

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        const min = document.getElementById('min-rating').value;
        const max = document.getElementById('max-rating').value;

        const response = await fetch(`/puzzle?min_rating=${min}&max_rating=${max}`);
        const data = await response.json();

        if (data.error) {
            alert(data.error);
        }
        else {
            loadPuzzle(data.fen, data.moves);
            puzzle_btn.innerText = "Get New Puzzle"
            originalFEN = data.fen;
            originalMoves = data.moves;
            originalURL = data.url;
            // console.log(data.fen);
            // console.log(data.moves);
            // console.log(data.url);
        }
    });

    reset_btn.addEventListener('click', function () {
        loadPuzzle(originalFEN, originalMoves);
    });

    analyseL_btn.addEventListener('click', function () {
        window.open(originalURL, '_blank');
    });
    
    analyseC_btn.addEventListener('click', function () {
        const encodedFEN = encodeURIComponent(updatedFEN);
        const chessComURL = `https://www.chess.com/analysis?fen=${encodedFEN}`;
        window.open(chessComURL, '_blank');
    })

    let board = null;
    let game = null;

    function loadPuzzle(fen, moves) {
        showOnPuzzle[0].style.visibility = "visible";
        showOnPuzzle[1].style.visibility = "visible";
        showOnPuzzle[2].style.visibility = "visible";
        showOnPuzzle[3].style.visibility = "visible";
        puzzle_btn.style.backgroundColor = "#4a90e2";
        reset_btn.style.backgroundColor = "#4a90e2";
        game = new Chess(fen);
        currentMoveIndex = 0;
        const sideMoved = fen.split(' ')[1]; // 'w' or 'b'
        const sideToMove = sideMoved === 'w' ? 'b' : 'w';
        const playerColor = sideToMove === 'w' ? 'White' : 'Black';
        showMessage(`${playerColor} to Play and Win!`);

        //RESET
        game.move({ from: moves[0].slice(0, 2), to: moves[0].slice(2, 4), promotion: 'q' });
        updatedFEN = game.fen();
        currentMoveIndex++;

        board = Chessboard('board', {
            position: game.fen(),
            pieceTheme: '/static/img/{piece}.png',
            orientation: sideToMove === 'w' ? 'white' : 'black',
            draggable: true,
            onDrop: function (source, target, piece, newPos, oldPos, orientation) {
                const move = game.move({
                    from: source,
                    to: target,
                    promotion: 'q'
                });
                if (move === null) return 'snapback';

                const expectedMove = moves[currentMoveIndex];

                const movedUCI = move.from + move.to + (move.promotion ? move.promotion : '');
                if (movedUCI === expectedMove) { //COMPARING UCI
                    currentMoveIndex++;
                    showMessage('✅ Correct Move!');

                    if (currentMoveIndex === moves.length) {
                        showMessage('🏁 Puzzle Solved!');

                        // Freeze the board by disabling dragging
                        board = Chessboard('board', {
                            position: game.fen(),
                            pieceTheme: '/static/img/{piece}.png',
                            draggable: false,
                            orientation: sideToMove === 'w' ? 'white' : 'black'
                        });

                        //Changing color of buttons
                        puzzle_btn.style.backgroundColor = "#4CAF50";
                        reset_btn.style.backgroundColor = "#4CAF50";
                    }
                    else {
                        computerMove = moves[currentMoveIndex];
                        const from = computerMove.slice(0, 2);
                        const to = computerMove.slice(2, 4);
                        const promotion = computerMove.length === 5 ? computerMove[4] : undefined;
                        game.move({ from, to, promotion });
                        board.position(game.fen());
                        currentMoveIndex++;
                    }

                } else {
                    game.undo();
                    showMessage('❌ Wrong move! Try again!');
                }
            },
            onSnapEnd: function () {
                board.position(game.fen());
            }
        });
    }

    function showMessage(msg) {
        let msgElem = document.getElementById("message");
        msgElem.textContent = msg;
    }

});