export const delay = (milliseconds: number) =>
  new Promise((resolve, _) => {
    setTimeout(() => resolve(), milliseconds);
  });
