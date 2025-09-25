import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, inject, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { GamesService } from '../../core/services/games.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-tic-tac-toe',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tic-tac-toe.component.html',
  styleUrl: './tic-tac-toe.component.scss'
})

export class TicTacToeComponent implements AfterViewInit{
  cells: NodeListOf<HTMLDivElement>;
//  status: HTMLDivElement;
//  resetButton: HTMLButtonElement;
  currentPlayer: 'X' | 'O';
  board: string[];
  gameActive: boolean;
  winningCombinations: number[][];

  rooter = inject(Router);
  gameService = inject(GamesService);
  toastr = inject(ToastrService)
  puntuacion:number = 6;
  endOfGame:boolean = false;
  userWins:boolean = false;

  @ViewChild('gameBoard') gameBoard: ElementRef | undefined;

  constructor() {
    this.cells = document.querySelectorAll('.cell') as NodeListOf<HTMLDivElement>;
    this.currentPlayer = 'X';
    this.board = ['', '', '', '', '', '', '', '', ''];
    this.gameActive = true;
    this.winningCombinations = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    console.log(this);
  }

  ngAfterViewInit() {
    if (this.gameBoard) { 
      this.cells = this.gameBoard.nativeElement.querySelectorAll('.cell') as NodeListOf<HTMLDivElement>;
      console.log(this.cells);
      this.cells.forEach(cell => cell.addEventListener('click', this.handleClick.bind(this)));

    } else {
      console.error("gameBoard not found in the DOM");
    }

    this.gameService.getPointsByGame("tictactoe");
  }

  checkWinner() {
    for (const combination of this.winningCombinations) {
        const [a, b, c] = combination;
        console.log(combination);
        if (this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
            return this.board[a];
        }
    }
    return this.board.includes('') ? null : 'T'; // si todavia tengo espacios para llenar envio un null
  }

  playAI() {
    if (!this.gameActive || this.currentPlayer !== 'O') return;

    const emptyIndices = this.board.map((cell, index) => cell === '' ? index : null).filter(index => index !== null);
    const randomIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];

    this.board[randomIndex] = this.currentPlayer;
    this.cells[randomIndex].textContent = this.currentPlayer;

    const winner = this.checkWinner();
    if (winner) {
        this.gameActive = false;
        //status.textContent = winner === 'T' ? "¡Es un empate!" : `¡Jugador ${winner} gana!`;
        if(winner === 'T')
        {
          console.log("Empate")
        }
        else
        {
          console.log("Jugador" + winner + "gana")
        }
    } else {
        this.currentPlayer = 'X';
        console.log("Turno jugador:" + this.currentPlayer)
        //status.textContent = `Jugador ${this.currentPlayer}'s turno`;
    }
  }

  handleClick(event: MouseEvent) {
    if (this.currentPlayer === 'O' || !this.gameActive) return; // Evita que haga click el jugador rapido en varias celdas

    const cell = event.target as HTMLDivElement;
    const index = parseInt(cell.getAttribute('data-index')!, 10);

    

    if (this.board[index]) return;

    this.board[index] = this.currentPlayer;
    cell.textContent = this.currentPlayer;
    this.puntuacion -= 1;

    const winner = this.checkWinner();
    if (winner) {
        this.gameActive = false;
        this.endOfGame = true; 
        if(winner === 'T')
          {
            console.log("Empate")
          }
          else
          {
            console.log("Jugador" + winner + "gana")
            this.toastr.info("Fin de la partida");
            if(winner==='X')
            {
              this.userWins=true;
              if(this.gameService.userPoints.tictactoe < this.puntuacion)
                {
                  this.gameService.setGameInfo("tictactoe",this.puntuacion);
                }
            }
          }
    } else {
        this.currentPlayer = 'O';
        console.log("Turno jugador:" + this.currentPlayer)
        setTimeout(this.playAI.bind(this), 500); // Espera 0.5 segundos antes de que la IA haga su jugada
    }
  }


  RootPath(path:string)
  {
    this.rooter.navigate([path]);
    this.puntuacion = 0;
    this.endOfGame = false;
  }

  
}

