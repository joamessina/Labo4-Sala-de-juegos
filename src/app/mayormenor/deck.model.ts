export interface Carta {
    img: string,
    value: number
  }

  export interface HtmlCarta {
    code: string,
    image: string,
    images: {
      svg: string,
      png: string
    };
    value: string,
    suit: string
  }