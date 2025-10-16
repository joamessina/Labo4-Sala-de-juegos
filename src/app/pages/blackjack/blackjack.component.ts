import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ResultadosService } from '../../services/resultados.service';
import { AuthService } from '../../../auth/auth.service';

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
  // === banca / apuestas ===
  bank = 1000; // banca inicial
  bet = 100; // apuesta por mano
  minBet = 50;
  maxBet = 500;

  inRound = false; // hay mano en juego

  private res = inject(ResultadosService);
  private auth = inject(AuthService);

  private router = inject(Router);

  ngOnInit() {}

  async newRound() {
    if (this.inRound || this.bank < this.bet) return;
    this.loading = true;
    this.message = '';
    this.ended = false;
    this.revealDealer = false;
    this.inRound = true;

    try {
      this.player = [];
      this.dealer = [];
      this.dealerHole = null;

      // Se coloca la apuesta sobre la mesa (descontamos ya)
      this.bank -= this.bet;

      // repartir
      const [p1, p2] = await this.draw(2);
      this.player.push(p1, p2);

      const [d1] = await this.draw(1);
      this.dealer.push(d1);

      const [hole] = await this.draw(1);
      this.dealerHole = hole;

      // naturales
      const playerBJ = this.total(this.player) === 21;
      const dealerBJ = this.total(this.dealerFull()) === 21;

      if (playerBJ || dealerBJ) {
        // revelamos si hay BJ de la banca
        if (this.dealerHole) {
          this.dealer.push(this.dealerHole);
          this.dealerHole = null;
        }
        this.revealDealer = true;

        if (dealerBJ && !playerBJ) {
          // pierde: ya se descontó la apuesta
          this.finishRound('Blackjack de la banca 😬', 0);
        } else if (playerBJ && !dealerBJ) {
          // paga 3:2 => devolvemos + 2.5x
          this.finishRound('¡Blackjack! Ganaste 🎉', this.bet * 2.5);
        } else {
          // push: devolver apuesta
          this.finishRound('Empate con blackjack', this.bet);
        }
        return;
      }
    } catch (e) {
      console.error(e);
      this.message = 'Error iniciando mazo.';
      this.ended = true;
      this.inRound = false;
      // devolvemos la apuesta por error operativo
      this.bank += this.bet;
    } finally {
      this.loading = false;
    }
  }

  private async saveResult(score: number) {
    const u = this.auth.user();
    if (!u?.email) return;
    try {
      await this.res.registrarResultado(u.email, score, 'Blackjack');
    } catch (e) {
      console.warn('[BJ] No pude guardar el resultado:', e);
    }
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
          this.finishRound('Blackjack de la banca 😬', 0);
        } else if (playerBJ && !dealerBJ) {
          this.finishRound('¡Blackjack! Ganaste 🎉', this.bet * 2.5);
        } else {
          this.finishRound('Empate con blackjack', this.bet);
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
    if (this.ended || this.loading || !this.inRound) return;
    this.loading = true;
    try {
      const [c] = await this.draw(1);
      this.player.push(c);
      if (this.total(this.player) > 21) {
        // bust: pierde, no se devuelve nada
        this.finishRound('Te pasaste de 21. Perdiste 😵', 0);
      }
    } finally {
      this.loading = false;
    }
  }

  async stand() {
    if (this.ended || this.loading || !this.inRound) return;
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
          // dealer bust → gana 1:1 (devolución + ganancia)
          this.finishRound('La banca se pasó. ¡Ganaste! 🎉', this.bet * 2);
          return;
        }
      }

      const ps = this.total(this.player);
      const ds = this.total(this.dealer);

      if (ds > ps) this.finishRound('La banca gana.', 0);
      else if (ds < ps) this.finishRound('¡Ganaste! 🎉', this.bet * 2);
      else this.finishRound('Empate.', this.bet);
    } finally {
      this.loading = false;
    }
  }

  private finishRound(msg: string, payout: number) {
    this.message = msg;
    this.ended = true;
    this.inRound = false;

    // si quedaba hole card la mostramos
    if (this.dealerHole) {
      this.dealer.push(this.dealerHole);
      this.dealerHole = null;
      this.revealDealer = true;
    }

    // pagar mesa: payout es lo que vuelve a la banca (0, bet, 2*bet, 2.5*bet)
    this.bank += payout;

    // si te quedaste sin fondos no podés jugar nueva mano
    if (this.bank < this.minBet) {
      this.message += ' — Banca agotada.';
    }
  }

  incBet() {
    this.bet = Math.min(this.maxBet, this.bet + 50);
  }
  decBet() {
    this.bet = Math.max(this.minBet, this.bet - 50);
  }

  async leaveTable() {
    // Guardás Banca final o (banca inicial - banca final) según prefieras.
    // Te dejo guardando la banca final como "puntaje".
    await this.saveResult(this.bank);
    this.router.navigateByUrl('/'); // o mostrar un swal y luego home
  }

  goHome() {
    this.router.navigateByUrl('/');
  }
}
