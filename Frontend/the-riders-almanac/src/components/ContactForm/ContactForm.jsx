import { useState } from "react";
import emailjs from "@emailjs/browser";

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const onChange = (e) => setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
  const validEmail = (v) => /^\S+@\S+\.\S+$/.test(v);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.name.trim()) return setError("Name is required.");
    if (!formData.email.trim() || !validEmail(formData.email)) return setError("Please enter a valid email.");

    try {
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        formData,
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      );
      setSubmitted(true);
    } catch (err) {
      setError("Something went wrong. Please try again in a moment.");
    }
  };

  return (
    <div className="min-h-dvh bg-[#0a0d0a] text-[#e8ebea] p-[clamp(20px,4vw,40px)]">
      <div className="mx-auto max-w-6xl">
        {/* Page Title */}
        <h1 className="text-[clamp(28px,5vw,64px)] font-extrabold tracking-wide mb-6">
          Contact <span className="text-[#a6d98a]">/</span> About
        </h1>

        {/* Grid: About (left) | Form (right) */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* About Card */}
          <section className="rounded-[14px] border border-[rgba(166,217,138,.18)] bg-[#0e1311] shadow-[0_20px_50px_rgba(0,0,0,.45)] overflow-hidden">
            <div className="p-6 md:p-8">
              <p className="uppercase tracking-[.06em] text-sm text-[rgba(233,236,239,.7)] mb-3">
                About The Rider’s Almanac
              </p>
              <h2 className="text-2xl md:text-3xl font-extrabold leading-tight mb-4">
                Built by a rider, for riders.
              </h2>

              <p className="leading-relaxed text-[rgba(233,236,239,.9)] mb-4">
                I’m Nate—lifelong rider and builder of The Rider’s Almanac. I’ve been on a bike for as long as I’ve been able to stand,
                spent over 15 years riding BMX at a professional level, and even ran my own BMX company. Bikes are home base for me.
              </p>

              <p className="leading-relaxed text-[rgba(233,236,239,.9)] mb-4">
                This app is my way of giving the community a clean, reliable hub: a place to find upcoming events and races, discover
                shops, skateparks, and trail systems, and plug into local ride culture. It’s not just about where you’re headed—it’s
                how you get there, who you meet, and the stories you bring back.
              </p>

              <p className="leading-relaxed text-[rgba(233,236,239,.9)]">
                If you’re hosting a ride, want to collaborate, or have ideas to make this better for the community, reach out below.
                Clip in, gear up, and let The Rider’s Almanac guide your next adventure.
              </p>
            </div>
          </section>

          {/* Contact Form Card */}
          <section className="rounded-[14px] border border-[rgba(166,217,138,.18)] bg-[#0e1311] shadow-[0_20px_50px_rgba(0,0,0,.45)] overflow-hidden">
            <div className="p-6 md:p-8">
              <p className="uppercase tracking-[.06em] text-sm text-[rgba(233,236,239,.7)] mb-3">
                Get in touch
              </p>
              <h2 className="text-2xl md:text-3xl font-extrabold leading-tight mb-6">Send a message</h2>

              {submitted ? (
                <div className="rounded-xl border border-[rgba(166,217,138,.18)] bg-[rgba(166,217,138,.06)] p-5">
                  <h3 className="text-xl font-extrabold text-[#a6d98a] mb-1">Your message was sent!</h3>
                  <p className="text-[rgba(233,236,239,.85)]">I’ll get back to you shortly.</p>
                </div>
              ) : (
                <form onSubmit={onSubmit} noValidate className="grid gap-4">
                  {error && (
                    <div className="rounded-lg border border-[rgba(255,107,107,.35)] bg-[rgba(255,107,107,.08)] px-3 py-2 text-[#ffdede]">
                      {error}
                    </div>
                  )}

                  <label className="grid gap-2">
                    <span className="text-sm tracking-wide text-[rgba(233,236,239,.72)]">Name</span>
                    <input
                      className="h-11 rounded-xl border border-[rgba(166,217,138,.18)] bg-[#171c17] px-3 text-[#e8ebea] outline-none focus:border-[#a6d98a] focus:ring-2 focus:ring-[rgba(166,217,138,.18)]"
                      type="text"
                      name="name"
                      placeholder="Your name"
                      value={formData.name}
                      onChange={onChange}
                      required
                    />
                  </label>

                  <label className="grid gap-2">
                    <span className="text-sm tracking-wide text-[rgba(233,236,239,.72)]">Email</span>
                    <input
                      className="h-11 rounded-xl border border-[rgba(166,217,138,.18)] bg-[#171c17] px-3 text-[#e8ebea] outline-none focus:border-[#a6d98a] focus:ring-2 focus:ring-[rgba(166,217,138,.18)]"
                      type="email"
                      name="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={onChange}
                      required
                    />
                  </label>

                  <label className="grid gap-2">
                    <span className="text-sm tracking-wide text-[rgba(233,236,239,.72)]">Subject</span>
                    <input
                      className="h-11 rounded-xl border border-[rgba(166,217,138,.18)] bg-[#171c17] px-3 text-[#e8ebea] outline-none focus:border-[#a6d98a] focus:ring-2 focus:ring-[rgba(166,217,138,.18)]"
                      type="text"
                      name="subject"
                      placeholder="Slide into our DM's!"
                      value={formData.subject}
                      onChange={onChange}
                    />
                  </label>

                  <label className="grid gap-2">
                    <span className="text-sm tracking-wide text-[rgba(233,236,239,.72)]">Message</span>
                    <textarea
                      className="min-h-[140px] rounded-xl border border-[rgba(166,217,138,.18)] bg-[#171c17] p-3 text-[#e8ebea] outline-none focus:border-[#a6d98a] focus:ring-2 focus:ring-[rgba(166,217,138,.18)]"
                      name="message"
                      placeholder="Tell me what you’re building, planning, or riding…"
                      value={formData.message}
                      onChange={onChange}
                      required
                    />
                  </label>

                  <div className="flex items-center justify-end">
                    <button
                      type="submit"
                      className="inline-flex h-11 items-center justify-center rounded-xl border border-[rgba(166,217,138,.18)] bg-[rgba(166,217,138,.10)] px-5 font-extrabold tracking-wide text-[#e8ebea] transition hover:bg-[rgba(166,217,138,.18)]"
                    >
                      Send Message
                    </button>
                  </div>
                </form>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}