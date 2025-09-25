import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AfterContentInit, Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { GamesService } from '../../core/services/games.service';
import {  NgxSpinnerModule, NgxSpinnerService } from "ngx-spinner";
import { Carta, HtmlCarta } from './deck.model';


@Component({
  selector: 'app-minmax',
  standalone: true,
  imports: [CommonModule,NgxSpinnerModule],
  templateUrl: './minmax.component.html',
  styleUrl: './minmax.component.scss'
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
  spinner = inject(NgxSpinnerService)

  puntuacion: number = 0;
  endOfGame:boolean = false;

  async ngOnInit() {
    this.spinner.show();
    await this.initiateDeck();
    await this.gameService.getPointsByGame("minmax");
    await this.gameService.getAllMinMax();
    await this.getDeckOfCards();
    
    this.spinner.hide();
  }



  initiateDeck() {
    // Use getACard() to fetch the data
    this.getDeck().subscribe(
      (deckData) => {
        console.log(deckData);
      },
      (error) => {
        // Handle errors
        console.error('Error getting card:', error);
      }
    );
  }

  getDeck() {
    const headers = new HttpHeaders({
      'User-Agent': 'Colmenas & Dragones',
      Accept: '*/*'
    });

    return this.httpService.get<any>(`https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1`, { headers: headers }).pipe(
      map(data => {

        this.deck = data;

        return this.deck;

      }),
      catchError(err => {
        console.error('Error getting random card:', err);
        return of({
          name: '',
          imageUrl: ''
        });
      })
    );
  }


  getDeckOfCards() {
    this.getAllCards().subscribe(
      (deckData: HtmlCarta[]) => {
        console.log(deckData);// las 52 cartas

        deckData.forEach(card => {
          let tempcard: Carta = 
          {
            img: card.images.png,
            value: this.formatValue(card.value)
          }

          this.normalizedDeck.push(tempcard);   
        });

        console.log(this.normalizedDeck);

        this.currentCard = this.normalizedDeck[52 - this.deck.remaining]

        this.deck.remaining -= 1;
      },
      (error) => {
        // Handle errors
        console.error('Error getting card:', error);
      }
    );
  }

  formatValue (cardVal: string): number
  {
    let value = 0
    switch (cardVal) {
      case "ACE":
        value = 1;
        break;
      case "JACK":
        value = 11;
        break;
      case "QUEEN":
        value = 12;
        break;
      case "KING":
        value = 13;
        break;
      default:
        value = Number(cardVal);
    }

    return value
  }

  getAllCards() {
    const headers = new HttpHeaders({
      'User-Agent': 'Colmenas & Dragones',
      Accept: '*/*'
    });

    return this.httpService.get<any>(`https://deckofcardsapi.com/api/deck/${this.deck.deck_id}/draw/?count=52`, { headers: headers }).pipe(
      map(data => {

        this.cardList = data.cards as HtmlCarta[];

        return this.cardList;

      }),
      catchError(err => {
        console.error('Error getting random card:', err);
        return of({
          name: '',
          imageUrl: ''
        });
      })
    );
  }

  /*
  getCard() {
    this.currentCard = this.cardList[52 - this.deck.remaining];
    switch (this.currentCard.value) {
      case "ACE":
        this.currentCard.value = 1;
        break;
      case "JACK":
        this.currentCard.value = 11;
        break;
      case "QUEEN":
        this.currentCard.value = 12;
        break;
      case "KING":
        this.currentCard.value = 13;
        break;
      default:
        this.currentCard.value = Number(this.currentCard.value);
    }
    this.deck.remaining -= 1;

  }
    */

  getACard()
  {
    this.currentCard = this.normalizedDeck[52 - this.deck.remaining];
    this.deck.remaining -= 1;
  }


  isSmaller() {
    if (this.currentCard) {
      this.lastCard = this.currentCard;
      this.getACard();

      if (this.currentCard.value <= this.lastCard.value) {
        console.log("nice");
        this.puntuacion += 1;
      }
      else {
        console.log("you lose");
        this.endOfGame = true;
        if (this.gameService.userPoints.minmax < this.puntuacion) {
          this.gameService.setGameInfo("minmax", this.puntuacion);
        }
      }
    }
  }

  isBigger() {
    if (this.currentCard) {
      this.lastCard = this.currentCard;
      this.getACard();

      if (this.currentCard.value >= this.lastCard.value) {
        console.log("nice");
        this.puntuacion += 1;
      }
      else {
        console.log("you lose");
        this.endOfGame = true;
        if (this.gameService.userPoints.minmax < this.puntuacion) {
          this.gameService.setGameInfo("minmax", this.puntuacion);
        }
      }
    }
  }


  RootPath(path:string)
  {
    this.rooter.navigate([path]);
    this.puntuacion = 0;
    this.endOfGame = false;
  }

}
