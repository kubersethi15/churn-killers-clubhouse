import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { trackGrowthEvent } from "@/utils/growthTracking";

const GrowthPageTracker = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    void trackGrowthEvent({ eventName: "page_view", pagePath: pathname });
  }, [pathname]);

  return null;
};

export default GrowthPageTracker;
