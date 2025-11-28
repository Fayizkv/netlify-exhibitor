// import React, { useEffect, useRef } from "react";
// import confetti from "canvas-confetti";

// const FireworksDisplay = () => {
//   const canvasRef = useRef(null);

//   useEffect(() => {
//     if (canvasRef.current) {
//       const myConfetti = confetti.create(canvasRef.current, {
//         resize: true,
//         useWorker: true,
//       });

//       myConfetti({
//         particleCount: 100,
//         spread: 160,
//         origin: { y: 0.6 },
//         colors: ["#bb0000", "#ffffff"],
//       });

//       const fire = () => {
//         myConfetti({
//           particleCount: 100,
//           spread: 160,
//           origin: { y: 0.6 },
//           colors: ["#bb0000", "#ffffff"],
//         });
//       };

//       const intervalId = setInterval(fire, 1000);

//       return () => clearInterval(intervalId);
//     }
//   }, []);

//   return <canvas ref={canvasRef} style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 9999 }} />;
// };

// export default FireworksDisplay;
