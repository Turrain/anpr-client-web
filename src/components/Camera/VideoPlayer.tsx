// VideoPlayer.jsx
import React from "react";
import ReactPlayer from "react-player";

const VideoPlayer = ({ url }) => {
  return (
    <div
      style={{
        position: "relative",
        paddingTop: "56.25%",
        height: "0",
        overflow: "hidden",
      }}
    >
      <ReactPlayer
        url={url}
        className="react-player"
        playing
        controls
        width="100%"
        height="100%"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          padding: "4px",
          backgroundColor: "darkorchid",
        }}
      />
    </div>
  );
};

export default VideoPlayer;
