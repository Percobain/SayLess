import { ShieldAlert } from 'lucide-react';

export default function AlertBanner({ message = "⚠️ EVEN WE CANNOT READ YOUR REPORTS • FULLY ENCRYPTED • ANONYMOUS BY DESIGN • " }) {
  // Double the message for seamless loop
  const repeatedMessage = message.repeat(4);
  
  return (
    <div className="neo-alert-banner">
      <div className="relative flex overflow-hidden">
        <div className="neo-alert-text flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 inline-block" />
          {repeatedMessage}
        </div>
      </div>
    </div>
  );
}
