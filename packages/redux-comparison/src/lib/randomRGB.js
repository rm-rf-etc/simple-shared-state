const randomRGB = () => ([
    Math.floor(Math.random()*256),
    Math.floor(Math.random()*256),
    Math.floor(Math.random()*256)
]);

export function randomRGBArray(arrayLength) {
  const rgbArray = [];
  for (let i=0; i < arrayLength; i++) {
    rgbArray.push(randomRGB);
  }
  return rgbArray;
}

export default randomRGB;
