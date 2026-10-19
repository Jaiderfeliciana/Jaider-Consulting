import Image from "next/image";
import smiling from "@/assets/photos/jaider-smiling.jpg";
import lobby from "@/assets/photos/jaider-lobby.jpg";

export default function Photos() {
  return (
    <section className="photos">
      <div className="container photo-row">
        <div className="photo photo-main">
          <Image src={smiling} alt="Jaider Feliciana, smiling" sizes="(max-width: 700px) 100vw, 60vw" priority />
          <div className="photo-card">
            <p>Hi, I&apos;m Jaider</p>
            <p>I build websites and marketing for Aruba businesses — and I answer my own WhatsApp.</p>
          </div>
        </div>
        <div className="photo photo-side">
          <Image src={lobby} alt="Jaider Feliciana standing in a lobby" sizes="(max-width: 700px) 100vw, 40vw" />
        </div>
      </div>
    </section>
  );
}
