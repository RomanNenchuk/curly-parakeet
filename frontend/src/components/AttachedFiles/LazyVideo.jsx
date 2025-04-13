import { useEffect, useRef, useState } from "react";
import { useWidth } from "../../contexts/ScreenWidthContext";

export default function LazyVideo({ src, videoId, className }) {
  const videoRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [videoSrc, setVideoSrc] = useState(""); // Додаємо стан для збереження src

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          setVideoSrc(src); // Встановлюємо src, коли елемент у полі зору
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    if (videoRef.current) observer.observe(videoRef.current);

    return () => observer.disconnect();
  }, [src]);

  return (
    <video
      key={videoId}
      src={videoSrc}
      ref={videoRef}
      controls
      preload="metadata"
      className={className}
      onClick={e => e.stopPropagation()}
      autoPlay
      loop
      muted
    />
  );
}
