import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  ViewChild,
} from '@angular/core';
import { GamesService } from '../../app/services/games.supabase.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-hangedman',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hangedman.component.html',
  styleUrls: ['./hangedman.component.scss'],
})
export class HangedmanComponent implements AfterViewInit {
  wordList: string[] = ['COLMENAS', 'ABEJA', 'PANAL', 'JUEGOS'];
  word!: string;
  wordChars: string[] = [];

  guesses = 6;
  guessedLetters: string[] = [];

  buttons!: NodeListOf<HTMLButtonElement>;

  endOfGame = false;
  puntuacion = 0;

  private gameService = inject(GamesService);
  private router = inject(Router);

  @ViewChild('keyboard') keyboard?: ElementRef<HTMLDivElement>;

  constructor() {
    this.startNewRound();
  }

  ngAfterViewInit() {
    if (!this.keyboard) {
      console.error('keyboard not found in the DOM');
      return;
    }
    this.buttons = this.keyboard.nativeElement.querySelectorAll('.key');
    this.buttons.forEach((btn) =>
      btn.addEventListener('click', this.handleClick.bind(this))
    );

    this.gameService.getPointsByGame('hangedman');
  }

  private startNewRound() {
    const idx = this.getRandomWord(0, this.wordList.length - 1);
    this.word = this.wordList[idx];
    this.wordChars = this.word.split('');
    this.guesses = 6;
    this.guessedLetters = [];
    this.endOfGame = false;
  }

  private resetKeyboardUI() {
    if (!this.buttons) return;
    this.buttons.forEach((b) => {
      b.disabled = false;
      b.classList.remove('key--right', 'key--wrong');
    });
  }

  handleClick(event: MouseEvent) {
    const button = event.target as HTMLButtonElement;
    const letter = (button.textContent ?? '').toUpperCase();
    if (!letter || this.guessedLetters.includes(letter)) return;

    this.guessedLetters.push(letter);

    if (this.word.includes(letter)) {
      button.classList.add('key--right');
    } else {
      button.classList.add('key--wrong');
      this.guesses -= 1;
    }

    button.disabled = true;
    this.checkState();
  }

  private checkState() {
    if (this.guesses <= 0) {
      this.endOfGame = true;
      this.disableButtons();
      return;
    }

    const allRevealed = this.wordChars.every((ch) =>
      this.guessedLetters.includes(ch)
    );
    if (allRevealed) {
      const best = this.gameService.userPoints['hangedman'] ?? 0;
      if (best < this.guesses) {
        this.gameService.setGameInfo('hangedman', this.guesses);
      }
      this.endOfGame = true;
      this.disableButtons();
    }
  }

  private disableButtons() {
    if (!this.buttons) return;
    this.buttons.forEach((b) => (b.disabled = true));
  }

  playAgain() {
    this.startNewRound();
    this.resetKeyboardUI();
    this.endOfGame = false;
  }

  goHome() {
    this.router.navigate(['/']);
  }

  private getRandomWord(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
