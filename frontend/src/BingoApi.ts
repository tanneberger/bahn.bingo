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

  async shareBingo(fields: Bingo) {
    return (await fetch(`${this.baseUrl}/share`, {
      method: "POST",
      body: JSON.stringify({
        field: fields.map((field) => field.id),
      }),
    }).then((data) => data.json())) as { picture_id: string };
  }
}
