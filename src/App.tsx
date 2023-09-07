import { useState } from "react";
import "./App.css";
import { Props, initProps } from "./interfaces/Props";
import { driver } from "./Driver";
import { Puzzle } from "./components/Puzzle";

function App() {
  const [props, setProps] = useState<Props>(initProps(40, 14, 33));
  return (
    <div className="App">
      <div>
        <button
          className="App-button"
          onClick={() => setProps(driver(props, false, false))}
        >
          Rand
        </button>
        <button
          className="App-button"
          onClick={() => setProps(driver(props, true, false))}
        >
          Best
        </button>
        <span className="App-count">{props.dispWordsQty}</span>
      </div>
      <div>
        <Puzzle {...props} />
      </div>
    </div>
  );
}

export default App;