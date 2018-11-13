export const MOBILE_WIDTH = 376
export const DESKTOP_WIDTH = MOBILE_WIDTH + 1

export function isMobile () {
  return window.innerWidth < DESKTOP_WIDTH
}

export function isDesktop () {
  return window.innerWidth >= DESKTOP_WIDTH
}
