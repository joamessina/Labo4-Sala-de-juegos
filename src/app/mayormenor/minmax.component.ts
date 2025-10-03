import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AfterContentInit, Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom, catchError, map, of } from 'rxjs';
import { GamesService } from '../../app/services/games.supabase.service';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { Carta, HtmlCarta } from './deck.model';

@Component({
  selector: 'app-minmax',
  standalone: true,
  imports: [CommonModule, NgxSpinnerModule],
  templateUrl: './minmax.component.html',
  styleUrls: ['./minmax.component.scss'],
})
export class MinmaxComponent implements OnInit {
  deck: any;
  cardList: any;

  lastCard?: Carta;
  currentCard?: Carta;

  normalizedDeck: Carta[] = [];

  httpService = inject(HttpClient);
  rooter = inject(Router);
  gameService = inject(GamesService);
  spinner: NgxSpinnerService = inject(NgxSpinnerService);

  puntuacion = 0;
  endOfGame = false;
  endMsg = '';

  async ngOnInit() {
    await this.initGame();
  }

  private async initGame() {
    this.spinner.show();
    try {
      this.endOfGame = false;
      this.puntuacion = 0;

      await this.gameService.getPointsByGame('minmax');

      this.deck = await this.getDeck();

      const deckData = await this.getAllCards();
      this.normalizedDeck = deckData.map((card) => ({
        img: card.images.png,
        value: this.formatValue(card.value),
      }));

      this.currentCard = this.normalizedDeck[52 - this.deck.remaining];
      this.deck.remaining -= 1;
    } catch (e) {
      console.error('[Minmax] init error', e);
    } finally {
      this.spinner.hide();
    }
  }

  async initiateDeck() {
    try {
      const deckData = await this.getDeck();
      console.log(deckData);
    } catch (e) {
      console.error('Error getting deck:', e);
    }
  }

  getDeck(): Promise<any> {
    return firstValueFrom(
      this.httpService.get<any>(
        'https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1'
      )
    );
  }

  async getDeckOfCards() {
    try {
      const deckData: HtmlCarta[] = await this.getAllCards();
      this.normalizedDeck = deckData.map((card) => ({
        img: card.images.png,
        value: this.formatValue(card.value),
      }));

      this.currentCard = this.normalizedDeck[52 - this.deck.remaining];
      this.deck.remaining -= 1;
    } catch (e) {
      console.error('Error getting cards:', e);
    }
  }

  formatValue(cardVal: string): number {
    switch (cardVal) {
      case 'ACE':
        return 1;
      case 'JACK':
        return 11;
      case 'QUEEN':
        return 12;
      case 'KING':
        return 13;
      default:
        return Number(cardVal);
    }
  }

  getAllCards(): Promise<HtmlCarta[]> {
    return firstValueFrom(
      this.httpService
        .get<any>(
          `https://deckofcardsapi.com/api/deck/${this.deck.deck_id}/draw/?count=52`
        )
        .pipe(map((data) => data.cards as HtmlCarta[]))
    );
  }

  getACard() {
    this.currentCard = this.normalizedDeck[52 - this.deck.remaining];
    this.deck.remaining -= 1;
  }

  isSmaller() {
    if (!this.currentCard) return;
    this.lastCard = this.currentCard;
    this.getACard();

    if (this.currentCard.value <= this.lastCard.value) {
      this.puntuacion += 1;
    } else {
      this.endOfGame = true;
      this.endMsg = '¡Perdiste!';
      const best = this.gameService.userPoints['minmax'] ?? 0;
      if (best < this.puntuacion) {
        this.gameService.setGameInfo('minmax', this.puntuacion);
      }
    }
  }

  isBigger() {
    if (!this.currentCard) return;
    this.lastCard = this.currentCard;
    this.getACard();

    if (this.currentCard.value >= this.lastCard.value) {
      this.puntuacion += 1;
    } else {
      this.endOfGame = true;
      this.endMsg = '¡Perdiste!';
      const best = this.gameService.userPoints['minmax'] ?? 0;
      if (best < this.puntuacion) {
        this.gameService.setGameInfo('minmax', this.puntuacion);
      }
    }
  }

  playAgain() {
    this.initGame();
  }

  goHome() {
    this.rooter.navigate(['/']);
  }
}
