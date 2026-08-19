import { useEffect, useState } from "react";
import { SmartImage } from "../../components/ui/SmartImage";
import { useI18n } from "../../lib/i18n";

const SLIDES = [
  {
    src: "/hero/hero-1.png",
    alt: "Editorial architectural photograph — the Supreme Court of India building",
  },
  {
    src: "/hero/hero-2.png",
    alt: "Editorial architectural photograph — law and justice architecture",
  },
  {
    src: "/hero/hero-3.png",
    alt: "Editorial documentary photograph — a citizen at a rural legal aid clinic",
  },
];

const INTERVAL_MS = 5000;

export function HeroSlideshow() {
  const { t } = useI18n();
  const [loaded, setLoaded] = useState<Record<number, boolean>>({});
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [progressKey, setProgressKey] = useState(0);

  const visible = SLIDES.map((_, i) => loaded[i] !== false).map((v, i) =>
    v ? i : null,
  ).filter((i): i is number => i !== null);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => {
      setIndex((i) => {
        if (visible.length <= 1) return i;
        const pos = visible.indexOf(i);
        return visible[(pos + 1) % visible.length];
      });
      setProgressKey((k) => k + 1);
    }, INTERVAL_MS);
    return () => clearInterval(t);
  }, [paused, visible]);

  const go = (dir: 1 | -1) => {
    if (visible.length <= 1) return;
    const pos = visible.indexOf(index);
    setIndex(visible[(pos + dir + visible.length) % visible.length]);
    setProgressKey((k) => k + 1);
  };

  const jump = (i: number) => {
    setIndex(i);
    setProgressKey((k) => k + 1);
  };

  return (
    <div
      className="hero-media"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="hero-slides" aria-live="off">
        {SLIDES.map((s, i) => (
          <figure
            key={s.src}
            className={`hero-slide ${i === index ? "hero-slide--active" : ""}`}
            aria-hidden={i !== index}
          >
            <SmartImage
              src={s.src}
              alt={t(s.alt)}
              eager
              onMissing={() => setLoaded((l) => ({ ...l, [i]: false }))}
            />
          </figure>
        ))}
      </div>

      <div className="hero-slideshow__controls">
        <span
          className="hero-slideshow__counter tabular"
          aria-label={t("Slide {x} of {y}", {
            x: visible.indexOf(index) + 1,
            y: visible.length,
          })}
        >
          {String(visible.indexOf(index) + 1).padStart(2, "0")} /{" "}
          {String(visible.length).padStart(2, "0")}
        </span>
        <div className="hero-slideshow__progress" role="tablist" aria-label={t("Slideshow slides")}>
          {SLIDES.map((s, i) =>
            loaded[i] === false ? null : (
              <button
                key={s.src}
                role="tab"
                aria-selected={i === index}
                aria-label={t("Show slide {n}", { n: i + 1 })}
                className={`hero-progress ${i === index ? "hero-progress--active" : ""}`}
                onClick={() => jump(i)}
              >
                <span
                  key={i === index ? progressKey : i}
                  className="hero-progress__fill"
                  style={{ animationDuration: `${INTERVAL_MS}ms`, animationPlayState: paused ? "paused" : "running" }}
                />
              </button>
            ),
          )}
        </div>
        <div className="hero-slideshow__arrows">
          <button className="hero-arrow" onClick={() => go(-1)} aria-label={t("Previous slide")}>
            ←
          </button>
          <button className="hero-arrow" onClick={() => go(1)} aria-label={t("Next slide")}>
            →
          </button>
        </div>
      </div>
    </div>
  );
}