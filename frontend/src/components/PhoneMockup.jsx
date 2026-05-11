const appTiles = ['green', 'blue', 'amber', 'red', 'violet', 'cyan', 'rose', 'graphite'];

export default function PhoneMockup() {
  return (
    <div className="phone-mockup">
      <div className="phone-screen">
        <div className="dynamic-island" />
        <div className="screen-heading">
          <span>íTech</span>
          <strong>Pro Store</strong>
        </div>
        <div className="tile-grid">
          {appTiles.map((tile, index) => (
            <span
              className={`app-tile ${tile}`}
              key={tile}
              style={{ animationDelay: `${0.08 * index}s` }}
            />
          ))}
        </div>
        <div className="phone-dock">
          <span />
          <span />
          <span />
        </div>
      </div>
    </div>
  );
}
