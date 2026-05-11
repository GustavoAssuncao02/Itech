import { Clock, MapPin } from 'lucide-react';

function isOpenNow(hours) {
  const now = new Date();
  const currentDay = now.getDay();
  const minutes = now.getHours() * 60 + now.getMinutes();

  return hours.some((entry) => {
    const starts = Number(entry.weekdayStart);
    const ends = Number(entry.weekdayEnd);
    return (
      currentDay >= starts &&
      currentDay <= ends &&
      minutes >= Number(entry.openMinutes) &&
      minutes <= Number(entry.closeMinutes)
    );
  });
}

export default function StoreHours({ hours, location, locations = [] }) {
  const open = isOpenNow(hours);

  return (
    <section className="hours-section" id="horarios">
      <div className="hours-copy">
        <p className="section-label">Funcionamento</p>
        <h2>Quando nos encontrar</h2>
        <p>
          <span className={open ? 'status-dot open' : 'status-dot'} />
          {open ? 'Aberto agora' : 'Fechado no momento'}
        </p>
        <p className="location-line">
          <MapPin size={18} aria-hidden="true" />
          {location}
        </p>
      </div>

      <div className="store-info-list">
        <div className="hours-list">
          {hours.map((entry) => (
            <article className="hours-card" key={entry.id}>
              <Clock size={20} aria-hidden="true" />
              <span>{entry.label}</span>
              <strong>{entry.displayTime}</strong>
            </article>
          ))}
        </div>

        <div className="locations-list">
          {locations.map((storeLocation) => (
            <article className="location-card" key={storeLocation.id}>
              <MapPin size={20} aria-hidden="true" />
              <span>{storeLocation.label}</span>
              {storeLocation.mapsUrl ? (
                <a href={storeLocation.mapsUrl} target="_blank" rel="noreferrer">
                  Abrir no mapa
                </a>
              ) : (
                <small>Mapa em breve</small>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
