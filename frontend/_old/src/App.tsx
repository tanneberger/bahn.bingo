import './App.css'
import BingoField from './componentes/BingoField';

function App() {
  return (
    <div className="container mx-auto">
      <section>
        <h1 className="text-3xl my-2"> Bahn Bingo </h1>
        <p className="my-2">
          Das hoch modern inovative feedback portal der Deutschen Bahn AG.
        </p>
      </section>
      <section>
        <BingoField />
      </section>
    </div>
  )
}

export default App
