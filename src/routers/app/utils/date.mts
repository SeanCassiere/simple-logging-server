function intlDateFormatter(date: Date) {
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  }).format(date);
}

export const dateFormatter = {
  humanReadable: intlDateFormatter,
};
