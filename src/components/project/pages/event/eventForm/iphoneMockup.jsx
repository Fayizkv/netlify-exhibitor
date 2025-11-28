import { ChevronLeft, Phone, Video } from "lucide-react";
import React from "react";
// import { Whatsapp } from '../../../../images';
import { Whatsapp } from "../../../../../images";

const IphoneMockup = ({ messageText = "", sender = "EventHex.ai" }) => {
  // Fixed height for consistent iPhone mockup
  const screenHeight = "h-[350px]";

  return (
    <div className="relative max-w-sm">
      {/* iPhone frame */}
      <div className="relative bg-black rounded-[2.5rem] p-2 shadow-2xl">
        {/* Screen */}
        <div className="bg-white rounded-[2rem] overflow-hidden relative">
          {/* Notch */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl z-10"></div>

          {/* Screen content */}
          <div className={`w-full ${screenHeight} bg-gray-50 relative transition-all duration-300 flex flex-col`}>
            {/* Header */}
            <div className="p-3 bg-gray-100 flex items-center justify-between text-black pt-8">
              <div className="flex items-center gap-2">
                <ChevronLeft className="text-blue-600" />
                <div className="w-8 h-8 bg-gray-400 rounded-full"></div>
                <span className="text-sm font-medium">{sender}</span>
              </div>
              <div className="flex items-center  justify-center gap-2">
                <Video className="text-blue-600" size={20} />
                <Phone className="text-blue-600" size={20} />
              </div>
            </div>

            {/* Message */}
            <div style={{ backgroundImage: `url(${Whatsapp})` }} className="p-3 flex-1 overflow-y-auto">
              <div className=" bg-white relative text-gray-800 rounded-lg border border-gray-200 shadow-sm p-3">
                <p className="text-sm leading-5 m-0 break-words whitespace-normal overflow-hidden">{messageText}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Home indicator */}
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-white rounded-full opacity-60"></div>
      </div>
    </div>
  );
};

export default IphoneMockup;
