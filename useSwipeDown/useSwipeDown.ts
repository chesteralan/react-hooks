import { RefObject } from "react";
import { useEventListener, useWindowSize } from "usehooks-ts";

const TOLERANCE = 50;
const DURATION = 25;
const OFFSET = 50;
const MAX_SCREEN = 500;

type Options = {
  tolerance?: number;
  duration?: number;
  offset?: number;
  maxScreen?: number;
};

const useSwipeDown = (targetElement: RefObject<HTMLDivElement>, callback: () => void, options?: Options) => {
  const { tolerance = TOLERANCE, duration = DURATION, offset: offsetOption = OFFSET, maxScreen = MAX_SCREEN } = options || {};
  const { width } = useWindowSize();

  let touchInterval: ReturnType<typeof setInterval>,
    touchDuration = 0,
    start = 0,
    end = 0,
    moved = 0,
    offset = 0;
  const touchStart = (evt: TouchEvent) => {
    if (width >= maxScreen) return;
    touchDuration = 0;
    touchInterval = setInterval(() => touchDuration++, 10);
    start = evt.touches[0].screenY;
  };
  const touchMove = (evt: TouchEvent) => {
    if (width >= maxScreen) return;
    end = evt.touches[0].screenY;
    moved = end - start;
    if (touchDuration <= duration) {
      if (targetElement.current) {
        (targetElement.current as HTMLDivElement).style.bottom = `-${moved}px`;
        offset = (moved / (targetElement.current as HTMLDivElement).clientHeight) * 100;
      }
    }
  };
  const touchEnd = (evt: TouchEvent) => {
    if (width >= maxScreen) return;
    clearInterval(touchInterval);
    const zoomed = (((evt as TouchEvent).view || window)?.visualViewport?.scale || 1) !== 1;
    const swiped = moved > tolerance;
    const fastSwipe = touchDuration <= duration;

    if ((!zoomed && swiped && fastSwipe) || offset > offsetOption) {
      callback();
    } else {
      moved = 0;
      if (targetElement.current) {
        (targetElement.current as HTMLDivElement).style.bottom = `0px`;
      }
    }
  };

  useEventListener("touchstart", touchStart, targetElement, true);
  useEventListener("touchmove", touchMove, targetElement, true);
  useEventListener("touchend", touchEnd, targetElement, true);
};

export default useSwipeDown;
