export const cities = [
  { id: "vladivostok", name: "Владивосток", location: "во Владивостоке" },
  { id: "khabarovsk", name: "Хабаровск", location: "в Хабаровске" },
  { id: "irkutsk", name: "Иркутск", location: "в Иркутске" },
];
export function getCity(id) {
  return cities.find((city) => city.id === id) || cities[0];
}
