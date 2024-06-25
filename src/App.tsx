import { useState } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/tauri";
import "./App.css";
import { open } from "@tauri-apps/api/dialog";
function App() {
  const [imagePath, setImagePath] = useState("");
  const [typeNumber, setTypeNumber] = useState(104);
  const [result, setResult] = useState([]);

  const handleFileChange = async () => {
    try {
      const selected = await open({
        multiple: false,
        filters: [
          { name: "Image Files", extensions: ["jpg", "jpeg", "png"] }
        ],
      });
      if (selected) {
        setImagePath(selected);
      }
    } catch (error) {
      console.error("Error selecting file:", error);
    }
  };

  const handleProcessImage = async () => {
    try {
      console.log({ imgPath: imagePath, typeNumber: typeNumber })
      const response = await invoke("greet", { imgPath: imagePath, typeNumber: typeNumber });
      setResult(response);
    } catch (error) {
      console.error("Error processing image:", error);
    }
  };

  return (
    <div className="container">
      <h1>Welcome to Tauri!</h1>

      <div className="row">
        <a href="https://vitejs.dev" target="_blank">
          <img src="/vite.svg" className="logo vite" alt="Vite logo" />
        </a>
        <a href="https://tauri.app" target="_blank">
          <img src="/tauri.svg" className="logo tauri" alt="Tauri logo" />
        </a>
        <a href="https://reactjs.org" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>

      <p>Click on the Tauri, Vite, and React logos to learn more.</p>

     
      <div>
      <h1>ANPR App</h1>
      <div>
      <label>
          Select Image:
          <button onClick={handleFileChange}>Choose File</button>
          {imagePath && <p>Selected file: {imagePath}</p>}
        </label>
      </div>
      <div>
        <label>
          Type Number:
          <input
            type="number"
            value={typeNumber}
            onChange={(e) => setTypeNumber(Number(e.target.value))}
          />
        </label>
      </div>
      <button onClick={handleProcessImage}>Process Image</button>
      {result.length > 0 && (
        <div>
          <h2>Plate Numbers</h2>
          <ul>
            {result.map((plate, index) => (
              <li key={index}>{plate}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
    </div>
  );
}

export default App;
