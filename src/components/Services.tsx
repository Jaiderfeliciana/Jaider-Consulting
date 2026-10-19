import Image from "next/image";
import { services } from "@/content/site";

export default function Services() {
  return (
    <section id="services" className="section">
      <div className="container">
        <div className="section-head">
          <h2 className="h2 services-title">Everything your business needs to get found online.</h2>
          <p className="eyebrow">01 / Services</p>
        </div>
        <div className="card-grid">
          {services.map((s, i) => (
            <div key={s.title} className={s.featured ? "service service-featured" : "service"}>
              <div className="service-img">
                <Image src={s.image} alt={s.imageAlt} sizes="(max-width: 600px) 100vw, 400px" />
              </div>
              <p className="service-num">{String(i + 1).padStart(2, "0")}</p>
              <h3>{s.title}</h3>
              <p className="service-desc">{s.description}</p>
              <p className="service-price">
                {s.price}
                {s.priceNote && <> <span>{s.priceNote}</span></>}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
