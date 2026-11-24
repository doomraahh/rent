import React, { useState } from "react";
import { Link } from "react-router-dom";
import { spaces } from "../database/spaces.js";
import { money } from "../utils/format.js";
import Interior from "../components/Interior.jsx";
import {
  spaceTypes,
  findOffer,
  typeLabel,
  seatsLabel,
} from "../utils/spaceTypes.js";

const defaultFilters = {
  search: "",
  type: "all",
  area: "",
  min: "",
  max: "",
  sort: "default",
};

export default function Catalog({ city }) {
  const [filters, setFilters] = useState(defaultFilters);
  const { search, type, area, min, max, sort } = filters;
  const query = search.trim().toLowerCase();
  const minPrice = min === "" ? 0 : Number(min);
  const maxPrice = max === "" ? Infinity : Number(max);
  let priceError = "";
  if (minPrice < 0 || maxPrice < 0) {
    priceError = "Стоимость не может быть отрицательной";
  } else if (minPrice > maxPrice) {
    priceError = "Стоимость «от» должна быть не больше стоимости «до»";
  }

  function changeFilter(event) {
    const { name, value } = event.target;
    setFilters((previous) => ({ ...previous, [name]: value }));
  }

  function resetFilters() {
    setFilters(defaultFilters);
  }

  const bookingType = type === "all" ? "desk" : type;
  const citySpaces = spaces.filter((space) => space.cityId === city.id);
  const areas = [...new Set(citySpaces.map((space) => space.area))];
  const list = (priceError ? [] : citySpaces)
    .map((space) => ({ space, offer: findOffer(space, bookingType) }))
    .filter(
      ({ space, offer }) =>
        offer &&
        (!area || space.area === area) &&
        `${space.name} ${space.address} ${space.area}`
          .toLowerCase()
          .includes(query) &&
        offer.price >= minPrice &&
        offer.price <= maxPrice,
    );
  if (sort === "asc") list.sort((a, b) => a.offer.price - b.offer.price);
  if (sort === "desc") list.sort((a, b) => b.offer.price - a.offer.price);

  return (
    <>
      <header className="page-heading catalog-heading">
        <h1>Найдите своё место</h1>
        <p>Коворкинги, кабинеты и переговорные {city.location}</p>
      </header>
      <section className="catalog-filters" aria-label="Фильтры каталога">
        <label className="form__field">
          Название или адрес
          <input
            className="form__control"
            value={search}
            name="search"
            onChange={changeFilter}
            type="search"
          />
        </label>
        <label className="form__field">
          Район
          <select
            className="form__control dropdown"
            value={area}
            name="area"
            onChange={changeFilter}
          >
            <option value="">Все районы</option>
            {areas.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label className="form__field">
          Пространства
          <select
            className="form__control dropdown"
            value={type}
            name="type"
            onChange={changeFilter}
          >
            <option value="all">Все пространства</option>
            {spaceTypes.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <fieldset className="catalog-price">
          <legend>Стоимость за час от / до</legend>
          <div className="catalog-price__inputs">
            <input
              className="form__control"
              type="number"
              min="0"
              step="1"
              placeholder="от"
              aria-label="Минимальная стоимость за час"
              value={min}
              name="min"
              onChange={changeFilter}
            />
            <input
              className="form__control"
              type="number"
              min="0"
              step="1"
              placeholder="до"
              aria-label="Максимальная стоимость за час"
              value={max}
              name="max"
              onChange={changeFilter}
            />
          </div>
        </fieldset>
      </section>
      {priceError && (
        <p className="alert" role="alert">
          {priceError}
        </p>
      )}
      <div className="catalog-results">
        <span role="status">Найдено пространств: {list.length}</span>
        <button className="button button--text" onClick={resetFilters}>
          Сбросить фильтры
        </button>
        <label className="form__field catalog-results__sort">
          Сортировка
          <select
            className="form__control dropdown catalog-results__select"
            aria-label="Сортировка"
            value={sort}
            name="sort"
            onChange={changeFilter}
          >
            <option value="default">По умолчанию</option>
            <option value="asc">Сначала дешевле</option>
            <option value="desc">Сначала дороже</option>
          </select>
        </label>
      </div>
      {list.length ? (
        <div className="catalog-grid">
          {list.map(({ space, offer }) => {
            const bookingPath = `/coworkings/${space.id}?type=${bookingType}`;
            return (
              <article className="space-card" key={space.id}>
                <div className="space-card__photo">
                  <Link to={bookingPath} tabIndex={-1} aria-hidden="true">
                    <Interior space={space} />
                  </Link>
                </div>
                <div className="space-card__body">
                  <p className="space-card__kind">
                    {type === "all"
                      ? space.offers
                          .map((offer) => typeLabel(offer.type))
                          .join(" · ")
                      : typeLabel(type)}
                  </p>
                  <h2 className="space-card__title">
                    <Link className="space-card__link" to={bookingPath}>
                      {space.name}
                    </Link>
                  </h2>
                  <p className="space-card__address">
                    <img
                      src="/icons/map-pin.svg"
                      alt=""
                      width="15"
                      height="20"
                    />
                    {space.address} · {space.area}
                  </p>
                  <div className="space-card__footer">
                    <div>
                      <strong className="space-card__price">
                        от {money(offer.price)}
                      </strong>
                      <span className="meta"> / час</span>
                      <p className="meta">{seatsLabel(offer.capacity)}</p>
                    </div>
                    <Link
                      className="button button--secondary space-card__choose"
                      to={bookingPath}
                    >
                      Выбрать место
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="empty-state">
          <h2>Подходящих пространств нет</h2>
        </div>
      )}
    </>
  );
}
