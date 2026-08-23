import { profile, education, awards } from '../../data/profile';
import { experience } from '../../data/experience';
import { certifications } from '../../data/certifications';
import { projects } from '../../data/projects';
import { skills, skillCategories } from '../../data/skills';

/**
 * Print-only resume view. Hidden on screen, visible only when the user
 * invokes the browser print dialog (Cmd/Ctrl+P or the "Print Resume" button).
 * Rendered once at the end of the document so it always appears last.
 */
export function PrintResume() {
  const featuredProjects = projects.filter((p) => p.featured).slice(0, 4);

  return (
    <div className="print-only" aria-hidden="true">
      <header className="print-header">
        <h1>{profile.name}</h1>
        <p className="print-title">{profile.title}</p>
        <p className="print-contact">
          {profile.location} · {profile.social.email} · {profile.social.phone} ·{' '}
          {profile.social.linkedin} · {profile.social.github}
        </p>
      </header>

      <section className="print-section">
        <h2>Summary</h2>
        <p>{profile.summary}</p>
      </section>

      <section className="print-section">
        <h2>Core Technologies</h2>
        {skillCategories.map((cat) => {
          const items = skills.filter((s) => s.category === cat);
          if (!items.length) return null;
          return (
            <p key={cat} className="print-skill-line">
              <span className="print-skill-cat">{cat}:</span>{' '}
              {items.map((s) => s.name).join(', ')}
            </p>
          );
        })}
      </section>

      <section className="print-section">
        <h2>Experience</h2>
        {experience.map((exp) => (
          <article key={exp.id} className="print-job print-avoid-break">
            <div className="print-job-head">
              <div>
                <h3>{exp.role}</h3>
                <p className="print-company">
                  {exp.company} · {exp.location}
                </p>
              </div>
              <span className="print-period">{exp.period}</span>
            </div>
            <p className="print-domain">{exp.domain}</p>
            <ul>
              {exp.achievements.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
            <p className="print-tech">Tech: {exp.headlineTech.join(' · ')}</p>
          </article>
        ))}
      </section>

      <section className="print-section">
        <h2>Selected Projects</h2>
        {featuredProjects.map((p) => (
          <article key={p.id} className="print-job print-avoid-break">
            <div className="print-job-head">
              <div>
                <h3>{p.name}</h3>
                <p className="print-company">
                  {p.company} · {p.period}
                </p>
              </div>
            </div>
            <p>{p.blurb}</p>
          </article>
        ))}
      </section>

      <section className="print-section">
        <h2>Certifications</h2>
        <ul>
          {certifications.map((c) => (
            <li key={c.id}>
              <strong>{c.name}</strong> — {c.issuer}
            </li>
          ))}
        </ul>
      </section>

      <section className="print-section">
        <h2>Education</h2>
        <ul>
          {education.map((e) => (
            <li key={e.degree}>
              <strong>{e.degree}</strong> — {e.institution} · {e.score} · {e.year}
            </li>
          ))}
        </ul>
      </section>

      {awards.length > 0 && (
        <section className="print-section">
          <h2>Awards</h2>
          <ul>
            {awards.map((a) => (
              <li key={a.title}>
                <strong>{a.title}</strong> — {a.issuer} · {a.year} · {a.detail}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
