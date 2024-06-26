import { useState } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/tauri";
import "./App.css";
import { open } from "@tauri-apps/api/dialog";
function App() {
  const [input, setInput] = useState("");
  const [typeNumber, setTypeNumber] = useState(104);
  const [result, setResult] = useState([]);
  const [isVideo, setIsVideo] = useState(false);
  const handleFileChange = async () => {
    try {
      const selected = await open({
        multiple: false,
        filters: [
          {
            name: "Image or Video Files",
            extensions: ["jpg", "jpeg", "png", "avi", "mp4"],
          },
        ],
      });
      if (selected) {
        setInput(selected);
      }
    } catch (error) {
      console.error("Error selecting file:", error);
    }
  };

  const handleUrlChange = (event) => {
    const url = event.target.value;
    setInput(url);
    setIsVideo(url.startsWith("http") || url.startsWith("rtsp"));
  };

  const handleProcess = async () => {
    try {
      const response = await invoke("process_anpr", { input, typeNumber });
      console.log({response});
      
      setResult(response);
    } catch (error) {
      console.error("Error processing ANPR:", error);
    }
  };

  return (
    <>
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
            Select Image/Video:
            <button onClick={handleFileChange}>Choose File</button>
          </label>
        </div>
        <div>
          <label>
            or Enter URL:
            <input type="text" value={input} onChange={handleUrlChange} />
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
        <button onClick={handleProcess}>Process</button>
        <div>
          {input && !isVideo && (
            <div>
              <h2>Selected Image</h2>
              <img src={input} alt="Selected" style={{ maxWidth: "100%" }} />
            </div>
          )}
          {input && isVideo && (
            <div>
              <h2>Video Stream</h2>
              <video controls autoPlay style={{ maxWidth: "100%" }}>
                <source src={input} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          )}
        </div>
        {result.length > 0 && (
          <div>
            <h2>Results</h2>
            <ul>
              {result.map((plate, index) => (
                <li key={index}>{plate}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
    </>
  );
}

export default App;
