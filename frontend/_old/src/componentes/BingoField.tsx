import { useState, useEffect } from "react";
import { api } from "../main";
import type { Bingo, Field } from "../BingoApi";
import ShareOnMastodon from "./ShareOnMastodon";
import { isBingoComplete } from "../helpers/bingo";

function BingoField() {
  const [fields, setFields] = useState(null as null | Bingo);
  const [bingoCoplete, setBingoComplete] = useState(false);

  useEffect(() => {
    (async () => {
      const bingo = await api.getBingo();
      setFields(bingo.sort(() => Math.random() - 0.5).slice(-9));
    })();
  }, []);

  return (
    <figure className="card m-auto md:w-1/2 xl:w-1/3 bg-base-100 shadow-xl p-4">
      <div className="grid grid-cols-3 mb-3">
        {fields &&
          fields.map((field: Field) => (
            <>
              <input
                id={field.id.toString()}
                onChange={(event) => {
                  field.checked = event.target.checked;
                  setBingoComplete(isBingoComplete(fields));
                }}
                type="checkbox"
                className="hidden"
              />
              <label
                htmlFor={field.id.toString()}
                className="bingo-field-label w-full aspect-square checked:bg-slate-500 flex justify-center items-center text-center border select-none"
              >
                {field.message}
              </label>
            </>
          ))}
      </div>
      {bingoCoplete && <p>BINGOOO!!!</p>}
      {fields && <ShareOnMastodon fields={fields} />}
    </figure>
  );
}

export default BingoField;
