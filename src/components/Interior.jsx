import React from "react";
export default function Interior({ space }) {
  return (
    <div className="interior">
      <img
        className="interior__image"
        loading="lazy"
        decoding="async"
        src={`/interiors/${space.id}.webp`}
        alt={`Интерьер коворкинга «${space.name}»`}
      />
    </div>
  );
}
