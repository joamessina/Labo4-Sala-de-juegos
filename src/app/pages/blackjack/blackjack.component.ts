import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

type ApiCard = {
  code: string;
  image: string;
  images?: { svg?: string; png?: string };
  value: string;
  suit: string;
};

type DrawResponse = {
  success: boolean;
  deck_id: string;
  cards: ApiCard[];
  remaining: number;
};

@Component({
  selector: 'app-blackjack',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './blackjack.component.html',
  styleUrls: ['./blackjack.component.scss'],
})
export class BlackjackComponent implements OnInit {
  loading = false;
  deckId: string | null = null;
  remaining = 0;

  player: ApiCard[] = [];
  dealer: ApiCard[] = [];
  dealerHole: ApiCard | null = null;

  img(c?: ApiCard | null): string {
    return c?.images?.png ?? c?.image ?? '';
  }

  message = '';
  ended = false;
  revealDealer = false;

  private router = inject(Router);

  ngOnInit() {
    this.reset();
  }

  private async newDeck() {
    const res = await fetch(
      'https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1'
    );
    const data = await res.json();
    this.deckId = data.deck_id;
    this.remaining = data.remaining ?? 52;
  }

  private async ensureCapacity(need: number) {
    if (!this.deckId || this.remaining < need) {
      await this.newDeck();
    }
  }

  private async draw(count: number): Promise<ApiCard[]> {
    await this.ensureCapacity(count);
    const res = await fetch(
      `https://deckofcardsapi.com/api/deck/${this.deckId}/draw/?count=${count}`
    );
    const data: DrawResponse = await res.json();

    if (!data.success || !data.cards?.length) {
      await this.newDeck();
      return this.draw(count);
    }

    this.remaining = data.remaining;
    return data.cards ?? [];
  }

  async reset() {
    this.loading = true;
    this.message = '';
    this.ended = false;
    this.revealDealer = false;

    try {
      this.player = [];
      this.dealer = [];
      this.dealerHole = null;

      const [p1, p2] = await this.draw(2);
      this.player.push(p1, p2);

      const [d1] = await this.draw(1);
      this.dealer.push(d1);

      const [hole] = await this.draw(1);
      this.dealerHole = hole;

      const playerBJ = this.total(this.player) === 21;
      const dealerBJ = this.total(this.dealerFull()) === 21;

      if (playerBJ || dealerBJ) {
        if (this.dealerHole) {
          this.dealer.push(this.dealerHole);
          this.dealerHole = null;
        }
        this.revealDealer = true;

        if (dealerBJ && !playerBJ) {
          this.end('Blackjack de la banca 😬');
        } else if (playerBJ && !dealerBJ) {
          this.end('¡Blackjack! Ganaste 🎉');
        } else {
          this.end('Empate con blackjack');
        }
        return;
      }
    } catch (e) {
      console.error(e);
      this.message = 'Error iniciando mazo.';
      this.ended = true;
    } finally {
      this.loading = false;
    }
  }

  private valueOf(card: ApiCard) {
    const v = card.value;
    if (v === 'ACE') return 11;
    if (v === 'KING' || v === 'QUEEN' || v === 'JACK') return 10;
    return parseInt(v, 10);
  }

  total(list: ApiCard[]) {
    let sum = 0;
    let aces = 0;
    for (const c of list) {
      sum += this.valueOf(c);
      if (c.value === 'ACE') aces++;
    }
    while (sum > 21 && aces > 0) {
      sum -= 10;
      aces--;
    }
    return sum;
  }

  private dealerFull(): ApiCard[] {
    return this.dealerHole
      ? [...this.dealer, this.dealerHole]
      : [...this.dealer];
  }

  async hit() {
    if (this.ended || this.loading) return;
    this.loading = true;
    try {
      const [c] = await this.draw(1);
      this.player.push(c);
      if (this.total(this.player) > 21)
        this.end('Te pasaste de 21. Perdiste 😵');
    } finally {
      this.loading = false;
    }
  }

  async stand() {
    if (this.ended || this.loading) return;
    this.loading = true;
    try {
      if (this.dealerHole) {
        this.revealDealer = true;
        this.dealer.push(this.dealerHole);
        this.dealerHole = null;
      }
      while (this.total(this.dealer) < 17) {
        const [c] = await this.draw(1);
        this.dealer.push(c);
        if (this.total(this.dealer) > 21) {
          this.end('La banca se pasó. ¡Ganaste! 🎉');
          return;
        }
      }
      const ps = this.total(this.player);
      const ds = this.total(this.dealer);
      if (ds > ps) this.end('La banca gana.');
      else if (ds < ps) this.end('¡Ganaste! 🎉');
      else this.end('Empate.');
    } finally {
      this.loading = false;
    }
  }

  private end(msg: string, reveal = true) {
    this.message = msg;
    this.ended = true;
    if (reveal && this.dealerHole) {
      this.dealer.push(this.dealerHole);
      this.dealerHole = null;
      this.revealDealer = true;
    }
  }

  goHome() {
    this.router.navigateByUrl('/');
  }
}
