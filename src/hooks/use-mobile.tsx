
import * as React from "react"

const MOBILE_BREAKPOINT = 768
const TABLET_BREAKPOINT = 1024

export function useIsMobile() {
  const [deviceInfo, setDeviceInfo] = React.useState(() => {
    if (typeof window === 'undefined') {
      return {
        isMobile: false,
        isTablet: false,
        deviceType: 'desktop' as const,
        isTouchDevice: false
      };
    }
    
    const width = window.innerWidth;
    const isMobile = width < MOBILE_BREAKPOINT;
    const isTablet = width >= MOBILE_BREAKPOINT && width < TABLET_BREAKPOINT;
    
    return {
      isMobile,
      isTablet,
      deviceType: isMobile ? 'mobile' as const : isTablet ? 'tablet' as const : 'desktop' as const,
      isTouchDevice: 'ontouchstart' in window
    };
  });

  React.useEffect(() => {
    const updateDeviceType = () => {
      const width = window.innerWidth;
      const isMobile = width < MOBILE_BREAKPOINT;
      const isTablet = width >= MOBILE_BREAKPOINT && width < TABLET_BREAKPOINT;
      
      setDeviceInfo({
        isMobile,
        isTablet,
        deviceType: isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop',
        isTouchDevice: 'ontouchstart' in window
      });
    };

    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    mql.addEventListener("change", updateDeviceType);
    
    return () => mql.removeEventListener("change", updateDeviceType);
  }, []);

  return deviceInfo;
}
