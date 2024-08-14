export const parseDateTime = (date) => {
  if (date === undefined) return;
  const dateItems = date.split(" ");
  const switchedDate = dateItems[0].split("/").reverse().join("-");
  return switchedDate + " " + dateItems[1];
};

export const parseItDateTime = (date) => {
  if (date === undefined) return;
  const dateItems = date.split(" ");
  const switchedDate = dateItems[0].split("-").reverse().join("/");
  return dateItems.length > 1
    ? switchedDate + " " + dateItems[1].slice(0, -3)
    : switchedDate;
};

export const parseItDate = (date) => {
  if (date === undefined) return;
  const dateItems = date.split(" ");
  const switchedDate = dateItems[0].split("-").reverse().join("/");
  return switchedDate;
};

export const parseDate = (date) => {
  if (date === undefined) return;
  const dateItems = date.split(" ");
  const switchedDate = dateItems[0].split("-").reverse().join("/");
  return switchedDate;
};

export const parseHour = (date) => {
  if (date === undefined) return;
  const dateItems = date.split(" ");
  const hour = dateItems[1].slice(0, -3);
  return hour === "00:00" ? "" : hour;
};

export const formatDateForMsg = (date) => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0"); // I mesi partono da 0
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const seconds = String(d.getSeconds()).padStart(2, "0");

  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
};
