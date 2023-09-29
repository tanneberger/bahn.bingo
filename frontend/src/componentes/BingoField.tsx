import { useState, useEffect } from 'react';
import { api } from '../main';
import type { Field } from '../BingoApi';

function BingoField() {
  const [fields, setFields] = useState(null as null | Array<Field>);

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
    <figure className="grid-container">
      {
        fields && fields.map((field: Field) => (
          <div key={field.id} className="grid-item">
            <input id={field.id.toString()} type="checkbox" className="bingo-field-input" />
            <label htmlFor={field.id.toString()} className="bingo-field-label">{field.message}</label>
          </div>
        ))
      }
    </figure>
  )
}

export default BingoField
