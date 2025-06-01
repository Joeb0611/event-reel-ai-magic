
import * as React from "react"

const MOBILE_BREAKPOINT = 768
const TABLET_BREAKPOINT = 1024

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)
  const [isTablet, setIsTablet] = React.useState<boolean | undefined>(undefined)
  const [deviceType, setDeviceType] = React.useState<'mobile' | 'tablet' | 'desktop'>('desktop')

  React.useEffect(() => {
    const updateDeviceType = () => {
      const width = window.innerWidth
      const mobile = width < MOBILE_BREAKPOINT
      const tablet = width >= MOBILE_BREAKPOINT && width < TABLET_BREAKPOINT
      
      setIsMobile(mobile)
      setIsTablet(tablet)
      setDeviceType(mobile ? 'mobile' : tablet ? 'tablet' : 'desktop')
    }

    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    mql.addEventListener("change", updateDeviceType)
    updateDeviceType()
    
    return () => mql.removeEventListener("change", updateDeviceType)
  }, [])

  return {
    isMobile: !!isMobile,
    isTablet: !!isTablet,
    deviceType,
    isTouchDevice: 'ontouchstart' in window
  }
}
