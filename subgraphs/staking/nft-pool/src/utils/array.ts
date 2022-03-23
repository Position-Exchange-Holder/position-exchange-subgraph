export function removeElementFromArray(element: string, array: string[]): string[] {
  let index = array.indexOf(element)
  if (index > -1) {
    array.splice(index, 1)
  }

  return array
}
