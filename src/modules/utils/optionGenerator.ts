export const generateOptions = (enumObj: any) => {
  return Object.values(enumObj).map((enumEach: any) => ({
    label: enumEach
      .split('_')
      .map(
        (word: string) =>
          word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
      )
      .join(' '),
    value: enumEach,
  }));
};
