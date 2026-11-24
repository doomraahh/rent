export const spaces = [
  {
    id: "central",
    cityId: "vladivostok",
    name: "Центральный",
    address: "Океанский проспект, 17",
    area: "Фрунзенский район",
    offers: [
      { type: "desk", price: 350, capacity: 12 },
      { type: "office", price: 700, capacity: 2 },
      { type: "meeting", price: 1200, capacity: 6 },
    ],
  },
  {
    id: "quarter",
    cityId: "vladivostok",
    name: "Деловой квартал",
    address: "ул. Некрасовская, 49А",
    area: "Первореченский район",
    offers: [
      { type: "desk", price: 450, capacity: 24 },
      { type: "office", price: 900, capacity: 4 },
      { type: "meeting", price: 1600, capacity: 10 },
    ],
  },
  {
    id: "atelier",
    cityId: "vladivostok",
    name: "Ателье",
    address: "ул. Светланская, 78Б",
    area: "Ленинский район",
    offers: [
      { type: "desk", price: 300, capacity: 8 },
      { type: "meeting", price: 1000, capacity: 6 },
    ],
  },
  {
    id: "park",
    cityId: "vladivostok",
    name: "У парка",
    address: "ул. Калинина, 275",
    area: "Первомайский район",
    offers: [
      { type: "desk", price: 280, capacity: 16 },
      { type: "meeting", price: 900, capacity: 6 },
    ],
  },
  {
    id: "line",
    cityId: "vladivostok",
    name: "Линия",
    address: "проспект 100-летия Владивостока, 155",
    area: "Советский район",
    offers: [
      { type: "desk", price: 400, capacity: 20 },
      { type: "office", price: 800, capacity: 2 },
      { type: "meeting", price: 1400, capacity: 6 },
    ],
  },
  {
    id: "port",
    cityId: "vladivostok",
    name: "Порт",
    address: "ул. Нижнепортовая, 1",
    area: "Фрунзенский район",
    offers: [
      { type: "desk", price: 380, capacity: 18 },
      { type: "meeting", price: 1300, capacity: 6 },
    ],
  },
  {
    id: "khabarovsk-quarter",
    cityId: "khabarovsk",
    name: "Квартал",
    address: "Деловая ул., 8",
    area: "Центр",
    offers: [
      { type: "desk", price: 450, capacity: 24 },
      { type: "office", price: 900, capacity: 4 },
      { type: "meeting", price: 1600, capacity: 10 },
    ],
  },
  {
    id: "khabarovsk-park",
    cityId: "khabarovsk",
    name: "У сквера",
    address: "Парковая ул., 15",
    area: "Парковый район",
    offers: [
      { type: "desk", price: 280, capacity: 16 },
      { type: "meeting", price: 900, capacity: 6 },
    ],
  },
  {
    id: "irkutsk-atelier",
    cityId: "irkutsk",
    name: "Мастерская",
    address: "Мастерская ул., 7",
    area: "Исторический район",
    offers: [
      { type: "desk", price: 300, capacity: 8 },
      { type: "meeting", price: 1000, capacity: 6 },
    ],
  },
  {
    id: "irkutsk-port",
    cityId: "irkutsk",
    name: "Берег",
    address: "Набережная ул., 10",
    area: "Набережная",
    offers: [
      { type: "desk", price: 380, capacity: 18 },
      { type: "meeting", price: 1300, capacity: 6 },
    ],
  },
];

export function findSpace(id) {
  return spaces.find((space) => space.id === id);
}
