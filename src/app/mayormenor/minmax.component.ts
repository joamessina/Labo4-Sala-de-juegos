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

  async ngOnInit() {
    this.spinner.show();
    try {
      await this.gameService.getPointsByGame('minmax');

      // 1) crear mazo
      this.deck = await this.getDeck(); // <-- ahora sí existe this.deck

      // 2) traer 52 cartas y normalizarlas
      const deckData = await this.getAllCards();
      this.normalizedDeck = deckData.map((card) => ({
        img: card.images.png,
        value: this.formatValue(card.value),
      }));

      // 3) setear carta actual
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
      const best = this.gameService.userPoints['minmax'] ?? 0; // 👈 corchetes
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
      const best = this.gameService.userPoints['minmax'] ?? 0; // 👈 corchetes
      if (best < this.puntuacion) {
        this.gameService.setGameInfo('minmax', this.puntuacion);
      }
    }
  }

  RootPath(path: string) {
    this.rooter.navigate([path]);
    this.puntuacion = 0;
    this.endOfGame = false;
  }
}
