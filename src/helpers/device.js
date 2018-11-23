export const MOBILE_WIDTH = 376
export const TABLET_WIDTH = 768
export const DESKTOP_WIDTH = TABLET_WIDTH + 1

export function isMobile () {
  return window.innerWidth < TABLET_WIDTH
}

export function isTablet () {
  return window.innerWidth >= TABLET_WIDTH && window.innerWidth < DESKTOP_WIDTH
}

export function isDesktop () {
  return window.innerWidth >= DESKTOP_WIDTH
}
