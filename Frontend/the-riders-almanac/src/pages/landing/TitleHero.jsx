import logo from "../../assets/logo.png";

const VIDEO =
  "https://res.cloudinary.com/dqg9xe92b/video/upload/v1763042702/202511130803_dja9y0.mp4";

export default function TitleHero({ onClick }) {
  return (
    <section
      onClick={onClick}
      className="title-hero"
      aria-label="Title screen (click to continue)"
    >
      {/* background video */}
      <video
        className="title-video"
        src={VIDEO}
        autoPlay
        loop
        muted
        playsInline
        aria-hidden="true"
      />

      {/* dark scrim */}
      <div className="title-scrim" />

      {/* centered overlay (always on top) */}
      <div className="title-overlay">
        <div className="overlay-inner">
          <img
            src={logo}
            alt="The Rider's Almanac"
            className="title-logo"
          />
<div className="fade-in-arrow">
  <svg
    viewBox="0 0 24 32"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <line
      x1="12"
      y1="4"
      x2="12"
      y2="24"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="m2 18 L12 26 L21 18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
</div>     
</div>
      </div>
    </section>
  );
}