export const generateVideoThumbnail = videoFile => {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    const videoUrl = URL.createObjectURL(videoFile);
    video.src = videoUrl;
    video.crossOrigin = "anonymous";
    video.currentTime = 0.5;
    video.muted = true;
    video.playsInline = true;

    video.onloadeddata = () => {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");

      video.onseeked = () => {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Отримуємо Blob із canvas (PNG)
        canvas.toBlob(blob => {
          // Створюємо URL для цього Blob
          const thumbnailUrl = URL.createObjectURL(blob);

          // Звільняємо пам'ять від ObjectURL відео
          URL.revokeObjectURL(videoUrl);

          resolve(thumbnailUrl);
        }, "image/png");
      };

      video.currentTime = 0.5;
    };

    video.onerror = error => {
      URL.revokeObjectURL(videoUrl);
      reject(error);
    };
  });
};
