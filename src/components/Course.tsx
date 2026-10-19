import { course } from "@/content/site";

export default function Course() {
  return (
    <section id="course" className="section">
      <div className="container split">
        <div>
          <p className="eyebrow" style={{ marginBottom: 20 }}>02 / Course</p>
          <h2 className="h2 course-title">Learn to build and market your business yourself.</h2>
          <p className="course-lede">
            An online course for business owners and anyone who wants to start doing this as a career. Follow along
            step by step — by the end you&apos;ll have your own website live and a content plan that works.
          </p>
          <p className="course-lang">Taught in English and Papiamento.</p>
          <div className="modules">
            {course.modules.map((m, i) => (
              <p key={m}><span>M{i + 1}</span> {m}</p>
            ))}
          </div>
          <a href="#contact" className="btn btn-primary course-cta">Enroll in the course</a>
        </div>
        <div className="course-card">
          <p className="eyebrow">Next group</p>
          <p className="course-format">{course.format}</p>
          <p className="course-details">{course.details}</p>
          <div className="course-divider" />
          <p className="course-price">{course.price}</p>
          <p className="course-installments">{course.installments}</p>
          <p className="eyebrow course-spots">
            {course.spotsLeft > 0 ? `only ${course.spotsLeft} spots left` : "waitlist open"}
          </p>
        </div>
      </div>
    </section>
  );
}
