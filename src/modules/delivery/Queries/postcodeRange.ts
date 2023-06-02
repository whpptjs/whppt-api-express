export const postcodeRange = (start: number, end: number) => {
  var _start = start;
  var arr = new Array(end - start + 1);
  for (var i = 0; i < arr.length; i++, _start++) {
    arr[i] = _start;
  }
  return arr;
};

export const postcodeInRange = (postcodes: string[], postcode: number) => {
  return postcodes.find(f => {
    const lowEnd = f.split('-')[0];
    const highEnd = f.split('-')[1];
    if (!highEnd) return Number(lowEnd) === postcode;
    const _range = postcodeRange(Number(lowEnd), Number(highEnd));
    return _range.find(inRangeCode => inRangeCode === postcode);
  });
};
