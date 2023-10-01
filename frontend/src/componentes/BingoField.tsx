import { useState, useEffect } from 'react';
import { api } from '../main';
import type { Bingo, Field } from '../BingoApi';
import ShareOnMastodon from './ShareOnMastodon';

const bingoCases = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

const isBingoComplete = (fields: Bingo) => bingoCases.some((bingoCase) => bingoCase.every((id) => fields[id].checked));

function BingoField() {
  const [fields, setFields] = useState(null as null | Bingo);
  const [bingoCoplete, setBingoComplete] = useState(false);

  useEffect(() => {
    (async () => {
      const bingo = await api.getBingo();
      setFields(
        bingo
          .sort(() => Math.random() - 0.5)
          .slice(-9)
      );
    })();
  }, []);

  return (
    <figure className="card w-218 bg-base-100 shadow-xl p-4">
      <div className="grid grid-cols-3 mb-3">
        {
          fields && fields.map((field: Field) => (
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
          ))
        }
      </div>
      {bingoCoplete && <p>BINGOOO!!!</p>}
      <ShareOnMastodon />
    </figure>
  )
}

export default BingoField
