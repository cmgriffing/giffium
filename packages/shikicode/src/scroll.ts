export function hookScroll(input: HTMLElement, output: HTMLElement) {
  const onScroll = () => {
    output.scrollTo(input.scrollLeft, input.scrollTop)
  }

  input.addEventListener('scroll', onScroll)

  return () => {
    input.removeEventListener('scroll', onScroll)
  }
}
