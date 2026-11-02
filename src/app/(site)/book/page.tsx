import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BookingPlanner from "@/components/BookingPlanner";
import HoursBar from "@/components/HoursBar";
import { booking, whatsappHref } from "@/content/site";

export const metadata: Metadata = {
  title: "Book a session — Jaider Feliciana",
  description: "Pick a time for a free consultation or a 1-on-1 session with Jaider Feliciana.",
};

export default function BookPage() {
  return (
    <>
      <Header />
      <main>
        <section className="section book">
          <div className="container">
            <p className="eyebrow" style={{ marginBottom: 20 }}>Planner</p>
            <h1 className="h2 book-title">Book your session.</h1>
            <p className="book-lede">
              {booking.calUsername
                ? "Choose a session, then pick a day and time. Booked times are taken off the calendar automatically, so you only see hours that are still free. You'll get a confirmation by email."
                : "Choose a session and send me a day and time that works for you on WhatsApp. I'll confirm within 24 hours."}
            </p>
            <HoursBar />
            <BookingPlanner />
            <p className="book-note">
              {booking.calUsername && "The calendar shows times in your own time zone; you can change it under the calendar. "}Prefer to talk first?{" "}
              <a href={whatsappHref("Hi Jaider! I have a question before booking.")} target="_blank" rel="noopener">
                Message me on WhatsApp
              </a>
              .
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
