const strToUint8 = function(str) {
  const array = new Uint8Array(str.length);

  for (let i = 0; i < str.length; i++) {
    array[i] = str.charCodeAt(i);
  }
  return array;
};

module.exports = strToUint8;
