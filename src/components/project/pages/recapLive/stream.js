// src/components/StreamSender.jsx
import { useEffect, useRef } from "react";

export default function StreamSender() {
  const socketRef = useRef(null);
  useEffect(() => {
    console.log("StreamSender");
  }, []);
  useEffect(() => {
    const socket = new WebSocket("ws://localhost:3000");
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("Connected to Next.js server");

      let count = 0;

      const interval = setInterval(() => {
        const message = `Message ${++count} from React`;
        socket.send(message);
        console.log("Sent:", message);
      }, 1000); // Send every second

      socket.onclose = () => clearInterval(interval);
    };

    socket.onmessage = (event) => {
      console.log("Received from server:", event.data);
    };

    return () => {
      socket.close();
    };
  }, []);

  return <div>Streaming to Next.js...</div>;
}
