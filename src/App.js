import React, {useCallback, useState} from 'react';
import './App.css';
import Theremin from './components/Theremin';

function App() {
    const [started, setStarted] = useState(false);

    const onClick = useCallback(() => {
        setStarted(true);
    }, []);

  return (
    <div className="App">
        <h2 className="App__title">JS Theremin</h2>
        {started
            ? <Theremin/>
            : <button className="App__button" onClick={onClick}>Start</button>
        }
    </div>
  );
}

export default App;
