import { useState, useEffect } from "react";
import { SkipLink } from "./SkipLink";
import { TopBar } from "./TopBar";
import { getLowVision, setLowVision } from "../lib/lowVision";

export function Shell({ children }: { children: React.ReactNode }) {
  const [lowVision, setLowVisionState] = useState(() => getLowVision());

  useEffect(() => {
    if (typeof document !== "undefined") {
      if (lowVision) {
        document.body.classList.add("low-vision");
      } else {
        document.body.classList.remove("low-vision");
      }
    }
  }, [lowVision]);

  const handleLowVisionChange = (enabled: boolean) => {
    setLowVision(enabled);
    setLowVisionState(enabled);
  };

  return (
    <div className="shell">
      <SkipLink />
      <TopBar lowVision={lowVision} onLowVisionChange={handleLowVisionChange} />
      <main id="content" className="shell__main" role="main" tabIndex={-1}>
        {children}
      </main>
    </div>
  );
}
