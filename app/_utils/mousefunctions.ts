export interface SwipeHandlers {
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: () => void;
}

export interface UseSwipeOptions<T extends string = string> {
  minSwipeDistance?: number;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  currentView: T;
  setCurrentView: (view: T) => void;
  leftView: T;
  rightView: T;
}

export const useSwipeHandlers = <T extends string = string>({
  minSwipeDistance = 50,
  onSwipeLeft,
  onSwipeRight,
  currentView,
  setCurrentView,
  leftView,
  rightView,
}: UseSwipeOptions<T>): SwipeHandlers => {
  let touchStart: number | null = null;
  let touchEnd: number | null = null;

  const onTouchStart = (e: React.TouchEvent) => {
    touchEnd = null;
    touchStart = e.targetTouches[0].clientX;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEnd = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && currentView === leftView) {
      if (onSwipeLeft) {
        onSwipeLeft();
      } else {
        setCurrentView(rightView);
      }
    }
    if (isRightSwipe && currentView === rightView) {
      if (onSwipeRight) {
        onSwipeRight();
      } else {
        setCurrentView(leftView);
      }
    }
  };

  return { onTouchStart, onTouchMove, onTouchEnd };
};

