/** Based from the answer on http://stackoverflow.com/questions/10615409/how-to-use-five-digit-long-unicode-characters-in-javascript */
function fixedFromCharCode(codePt) {
  if (codePt > 0xFFFF) {
    codePt -= 0x10000;
    return String.fromCharCode(0xD800 + (codePt >> 10), 0xDC00 + (codePt & 0x3FF));
  }
  else {
    return String.fromCharCode(codePt);
  }
}