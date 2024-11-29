const readline = require('readline');

// Konstanta untuk game
const N = 9;             // Ukuran papan
const MINI_BOX_SIZE = 3; // Ukuran kotak mini 3x3
const DIFFICULTY = {
    EASY: 13,
    MEDIUM: 29,
    HARD: 41
};

// Class untuk papan Sudoku
class SudokuBoard {
    constructor() {
        // Inisialisasi papan kosong
        this.solved = Array(N).fill().map(() => Array(N).fill(0));
        this.unsolved = Array(N).fill().map(() => Array(N).fill(0));
        this.emptyCells = DIFFICULTY.MEDIUM; // Default ke level medium
    }

    // Generator angka random
    randomGenerator(num) {
        return Math.floor(Math.random() * num) + 1;
    }

    // Cek apakah aman menempatkan angka
    checkIfSafe(i, j, num) {
        return (
            this.isAbsentInRow(i, num) && 
            this.isAbsentInCol(j, num) && 
            this.isAbsentInBox(i - i % MINI_BOX_SIZE, j - j % MINI_BOX_SIZE, num)
        );
    }

    // Cek apakah angka tidak ada dalam kotak 3x3
    isAbsentInBox(rowStart, colStart, num) {
        for (let i = 0; i < MINI_BOX_SIZE; i++) {
            for (let j = 0; j < MINI_BOX_SIZE; j++) {
                if (this.unsolved[rowStart + i][colStart + j] === num) {
                    return false;
                }
            }
        }
        return true;
    }

    // Cek apakah angka tidak ada dalam baris
    isAbsentInRow(i, num) {
        return !this.unsolved[i].includes(num);
    }

    // Cek apakah angka tidak ada dalam kolom
    isAbsentInCol(j, num) {
        return !this.unsolved.map(row => row[j]).includes(num);
    }

    // Isi nilai pada papan
    fillValues() {
        this.fillDiagonal();
        this.fillRemaining(0, MINI_BOX_SIZE);
        
        // Salin papan yang sudah terselesaikan
        this.solved = this.unsolved.map(row => [...row]);
        this.addEmptyCells();
    }

    // Isi kotak diagonal
    fillDiagonal() {
        for (let i = 0; i < N; i += MINI_BOX_SIZE) {
            this.fillBox(i, i);
        }
    }

    // Isi kotak 3x3
    fillBox(row, col) {
        for (let i = 0; i < MINI_BOX_SIZE; i++) {
            for (let j = 0; j < MINI_BOX_SIZE; j++) {
                let num;
                do {
                    num = this.randomGenerator(N);
                } while (!this.isAbsentInBox(row, col, num));
                this.unsolved[row + i][col + j] = num;
            }
        }
    }

    // Isi sisa sel secara rekursif
    fillRemaining(i, j) {
        if (j >= N && i < N - 1) {
            i++;
            j = 0;
        }
        if (i >= N && j >= N) return true;

        if (i < MINI_BOX_SIZE) {
            if (j < MINI_BOX_SIZE) j = MINI_BOX_SIZE;
        } else if (i < N - MINI_BOX_SIZE) {
            if (j === Math.floor(i / MINI_BOX_SIZE) * MINI_BOX_SIZE) {
                j += MINI_BOX_SIZE;
            }
        } else {
            if (j === N - MINI_BOX_SIZE) {
                i++;
                j = 0;
                if (i >= N) return true;
            }
        }

        for (let num = 1; num <= N; num++) {
            if (this.checkIfSafe(i, j, num)) {
                this.unsolved[i][j] = num;
                if (this.fillRemaining(i, j + 1)) return true;
                this.unsolved[i][j] = 0;
            }
        }
        return false;
    }

    // Tambah sel kosong sesuai level kesulitan
    addEmptyCells() {
        let count = this.emptyCells;
        while (count > 0) {
            const cellId = this.randomGenerator(N * N) - 1;
            const i = Math.floor(cellId / N);
            let j = cellId % N;
            
            if (j !== 0) j--;
            
            if (this.unsolved[i][j] !== 0) {
                count--;
                this.unsolved[i][j] = 0;
            }
        }
    }

    // Cek apakah papan sudah terselesaikan
    isBoardSolved() {
        for (let i = 0; i < N; i++) {
            for (let j = 0; j < N; j++) {
                if (this.unsolved[i][j] !== this.solved[i][j]) return false;
            }
        }
        return true;
    }
}

// Fungsi untuk menampilkan papan Sudoku
function printSudoku(board) {
    console.log("  X 1 2 3  4 5 6  7 8 9");
    console.log("Y -------------------------");
    
    for (let i = 0; i < N; i++) {
        if (i !== 0 && i % 3 === 0) {
            console.log("  -------------------------");
        }
        let row = `${i + 1} |`;
        for (let j = 0; j < N; j++) {
            if (j % 3 === 0 && j !== 0) row += "|";
            row += ` ${board.unsolved[i][j] || " "}`;
        }
        row += " |";
        console.log(row);
    }
    console.log("  -------------------------");
}

// Fungsi untuk memulai game baru
function startGame(difficulty = 'MEDIUM') {
    const board = new SudokuBoard();
    board.emptyCells = DIFFICULTY[difficulty];
    board.fillValues();
    return board;
}

// Fungsi untuk membuat gerakan
function makeMove(board, row, col, value) {
    if (row < 0 || row >= N || col < 0 || col >= N) {
        return { success: false, message: "Posisi tidak valid" };
    }
    
    if (board.unsolved[row][col] !== 0) {
        return { success: false, message: "Sel sudah terisi" };
    }
    
    if (value < 1 || value > 9) {
        return { success: false, message: "Nilai tidak valid" };
    }
    
    if (board.solved[row][col] === value) {
        board.unsolved[row][col] = value;
        return { 
            success: true, 
            message: "Gerakan valid",
            isComplete: board.isBoardSolved()
        };
    }
    
    return { success: false, message: "Nilai tidak sesuai" };
}

// Buat interface readline untuk interaksi dengan user
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Fungsi untuk menanyakan input dari user
function askQuestion(question) {
    return new Promise(resolve => rl.question(question, resolve));
}

// Fungsi utama untuk menjalankan game
async function playGame() {
    console.log("\nSelamat datang di Game Sudoku!\n");
    
    // Pilih level kesulitan
    console.log("Pilih level kesulitan:");
    console.log("1. Mudah");
    console.log("2. Sedang (default)");
    console.log("3. Sulit");
    
    const level = await askQuestion("Masukkan pilihan (1-3): ");
    
    let difficulty = 'MEDIUM';
    switch(level) {
        case '1': 
            difficulty = 'EASY';
            console.log("\nLevel Mudah dipilih\n");
            break;
        case '3': 
            difficulty = 'HARD';
            console.log("\nLevel Sulit dipilih\n");
            break;
        default: 
            console.log("\nLevel Sedang dipilih\n");
    }

    // Mulai game baru
    const game = startGame(difficulty);
    let attempts = 0;
    
    while (!game.isBoardSolved()) {
        console.clear(); // Bersihkan layar
        console.log(`Percobaan: ${attempts}\n`);
        printSudoku(game);
        
        try {
            // Minta input dari user
            const col = parseInt(await askQuestion("Masukkan kolom (1-9): ")) - 1;
            const row = parseInt(await askQuestion("Masukkan baris (1-9): ")) - 1;
            
            // Validasi input posisi
            if (row > 8 || col > 8 || row < 0 || col < 0) {
                const retry = await askQuestion("Posisi tidak valid! Coba lagi? (y/n): ");
                if (retry.toLowerCase() !== 'y') {
                    break;
                }
                continue;
            }
            
            // Cek apakah sel sudah terisi
            if (game.unsolved[row][col] !== 0) {
                const retry = await askQuestion("Sel sudah terisi! Coba lagi? (y/n): ");
                if (retry.toLowerCase() !== 'y') {
                    break;
                }
                continue;
            }
            
            const value = parseInt(await askQuestion("Masukkan angka (1-9): "));
            attempts++;
            
            // Buat gerakan
            const result = makeMove(game, row, col, value);
            
            if (!result.success) {
                const retry = await askQuestion(`${result.message}! Coba lagi? (y/n): `);
                if (retry.toLowerCase() !== 'y') {
                    break;
                }
            }
            
        } catch (error) {
            console.log("Input tidak valid! Mohon masukkan angka.");
            await askQuestion("Tekan Enter untuk melanjutkan...");
        }
    }
    
    // Cek apakah permainan selesai
    if (game.isBoardSolved()) {
        console.clear();
        printSudoku(game);
        console.log("\nSelamat! Anda berhasil menyelesaikan puzzle!");
        console.log(`Total percobaan: ${attempts}`);
    }
    
    // Tanya apakah ingin main lagi
    const playAgain = await askQuestion("\nMau main lagi? (y/n): ");
    if (playAgain.toLowerCase() === 'y') {
        console.clear();
        await playGame();
    } else {
        rl.close();
    }
}

// Mulai permainan
console.clear();
playGame().catch(console.error); 