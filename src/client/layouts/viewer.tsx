import { useCallback, useEffect, useRef, useState } from "react";
import ViewerFooter from "../components/Viewer/Footer";
import ViewerHeader from "../components/Viewer/Header";


const Layout = ({ children }: { children: React.ReactNode }) => {
  const [isVisible, setIsVisible] = useState(true);
  const headerSize = 4 * 16
  const footerSize = 4 * 16
  const hideTimerRef = useRef<number | undefined>(undefined)

  const clearHideTimer = useCallback(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current)
      hideTimerRef.current = undefined
    }
  }, [])

  const startHideTimer = useCallback(() => {
    clearHideTimer()
    hideTimerRef.current = window.setTimeout(() => {
      setIsVisible(false)
    }, 2000)
  }, [clearHideTimer])

  const showAndHide = () => {
    clearHideTimer()
    setIsVisible(true)
    startHideTimer()
  }

  useEffect(() => {
    startHideTimer()

    const handleMouseMove = (e: MouseEvent) => {
      if (e.clientY < headerSize) {
        showAndHide()
      }

      if (isVisible && e.clientY > window.innerHeight - footerSize) {
        showAndHide()
      }
    }

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0]
      if (touch.clientY < headerSize) {
        showAndHide()
      }
      if (isVisible && touch.clientY > window.innerHeight - footerSize) {
        showAndHide()
      }
    }

    const handleClick = (e: MouseEvent) => {
      if (e.clientY < headerSize) {
        e.stopPropagation()
        showAndHide()
      }
      if (isVisible && e.clientY > window.innerHeight - footerSize) {
        e.stopPropagation()
        showAndHide()
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('touchstart', handleTouchStart)
    window.addEventListener('click', handleClick)

    return () => {
      clearHideTimer()
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('click', handleClick)
    }
  }, [startHideTimer, clearHideTimer, headerSize, footerSize, isVisible])


  return (
    <>
      <ViewerHeader isVisible={isVisible} />
      {children}
      <ViewerFooter isVisible={isVisible} />
    </>

  );
}

export default Layout