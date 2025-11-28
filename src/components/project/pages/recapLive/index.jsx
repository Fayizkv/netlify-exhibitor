import React, { useEffect, useState } from "react";
import { AudioTranscriptor } from "./AudioTranscriber";
import { getData } from "../../../../backend/api";

const RecapLive = (props) => {
  const [eventId, setEventId] = useState(props.openData.data._id);
  const [translationLanguage, setTranslationLanguage] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  //   useEffect(() => {
  //     // setEventId(props.opeData._id)
  //     console.log(props, 'props')
  //     setEventId(props.openData.data._id)
  //   }, [props])
  useEffect(() => {
    console.log(props, "props");
    const fetchData = async () => {
      try {
        const response = await getData({ event: eventId }, "instarecap-setting");
        console.log(response, "response");
        console.log(response.data.response[0].translationLanguages, "translatedLanguages");
        setTranslationLanguage(response.data.response[0].translationLanguages);
        // setData(response.data)
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };
    if (eventId) {
      fetchData();
    }
  }, [eventId]);

  return (
    <div className="bg-slate-50 min-h-screen font-sans w-full">
      <div className="w-full px-4 py-8">
        {/* Header */}
        {/* <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-3">Live Audio Transcriptor</h1>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Real-time multilingual speech-to-text transcription powered by Deepgram's nova-3 model. 
            Speaks any language? No problem - it automatically detects and translates to English!
          </p>
        </div> */}

        <AudioTranscriptor translationLanguages={translationLanguage} roomId={eventId} />

        {/* Features & Info */}
        {/* <div className="mt-8 grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <span className="text-primary">⚡</span>
              Features
            </h3>
            <ul className="space-y-2 text-slate-600">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                Real-time audio transcription
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                Interim & final results display
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                Smart formatting & punctuation
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                Low-latency WebSocket streaming
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                Nova-3 multilingual model
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                Automatic language detection
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                Auto-translate to English
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <span className="text-primary">✅</span>
              Technical Specs
            </h3>
            <ul className="space-y-2 text-slate-600">
              <li className="flex justify-between">
                <span>Audio Format:</span>
                <span className="font-mono text-sm">WebM/Opus</span>
              </li>
              <li className="flex justify-between">
                <span>Sample Rate:</span>
                <span className="font-mono text-sm">16kHz</span>
              </li>
              <li className="flex justify-between">
                <span>Channels:</span>
                <span className="font-mono text-sm">Mono</span>
              </li>
              <li className="flex justify-between">
                <span>Model:</span>
                <span className="font-mono text-sm">nova-3</span>
              </li>
              <li className="flex justify-between">
                <span>SDK Version:</span>
                <span className="font-mono text-sm">Latest</span>
              </li>
            </ul>
          </div>
        </div> */}

        {/* Footer */}
        {/* <div className="mt-12 text-center text-slate-500 text-sm">
          <p>
            Powered by <a href="https://deepgram.com" className="text-primary hover:text-primary/80 font-medium">Deepgram API</a> • 
            <a href="https://developers.deepgram.com/docs/js-sdk" className="text-primary hover:text-primary/80 ml-2">View Documentation</a>
          </p>
        </div> */}
      </div>
    </div>
  );
};

export default RecapLive;
