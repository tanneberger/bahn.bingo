export type Field = {
  message: string;
  id: number;
  checked: boolean;
};

export type Bingo = Array<Field>;

export class BingoApi {
  baseUrl: string;

  constructor(baseUrl: string = "https://api.bahn.bingo") {
    this.baseUrl = baseUrl;
  }

  async getBingo() {
    return Object.entries(
      await fetch(`${this.baseUrl}/bingo`).then((data) => data.json()),
    ).map(([id, message]) => ({
      id: Number(id),
      message,
      checked: false,
    })) as Bingo;
  }

  getBingoUrl(fields: Bingo) {
    return `${this.baseUrl}/share/${btoa(
      fields.map((field) => field.id).join(","),
    )}.png`;
  }
}
