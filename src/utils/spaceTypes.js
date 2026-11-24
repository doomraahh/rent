export const spaceTypes = [
  { id: "desk", label: "Коворкинг" },
  { id: "office", label: "Кабинет" },
  { id: "meeting", label: "Переговорная" },
];
export const typeLabel = (type) =>
  spaceTypes.find((item) => item.id === type)?.label || "Коворкинг";
export function findOffer(space, type) {
  return space?.offers.find((offer) => offer.type === type);
}

export function getSeatCount(offer) {
  return offer.type === "desk" ? offer.capacity : 1;
}
export function seatsLabel(count) {
  const last = count % 10,
    lastTwo = count % 100;
  const word =
    lastTwo >= 11 && lastTwo <= 14
      ? "мест"
      : last === 1
        ? "место"
        : last >= 2 && last <= 4
          ? "места"
          : "мест";
  return `${count} ${word}`;
}
