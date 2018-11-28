export const MOBILE_WIDTH = 426
export const TABLET_WIDTH = 768
export const DESKTOP_WIDTH = 1024

export function isMobile () {
  return window.innerWidth <= MOBILE_WIDTH
}

export function isTablet () {
  return window.innerWidth > MOBILE_WIDTH && window.innerWidth <= TABLET_WIDTH
}

export function isDesktop () {
  return window.innerWidth > TABLET_WIDTH
}
