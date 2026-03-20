import { useEffect, useRef } from "react";
// import './VideoSplash.css';
import myIntroVideo from './logo_video.mp4';

const VideoSplash = ({ onComplete }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch((error) => {
        console.log("AutoPlay prevented:", error);
      });
    }
  }, []);

  return (
    <div className="splash-container">
      <video
        ref={videoRef}
        className="splash-video"
        muted
        autoPlay
        playsInline
        onEnded={onComplete}
      >
        <source src={myIntroVideo} type="video/mp4" />
      </video>
      <button className="skip-btn" onClick={onComplete}>Skip</button>
    </div>
  );
};


export default VideoSplash;