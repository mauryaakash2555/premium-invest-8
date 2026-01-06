export default function ClosingPerspective({
  title = "Closing Perspective",
  children,
}) {
  return (
    <section className="relative mx-auto w-full max-w-3xl px-4 sm:px-6 py-14 sm:py-16 text-center">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <span className="font-serif text-[140px] sm:text-[180px] leading-none text-white/[0.05]">
          “
        </span>
      </div>

      <h2 className="relative z-10 font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-white">
        {title}
      </h2>

      <div className="relative z-10 mt-5 text-base sm:text-[17px] leading-relaxed text-white/75">
        {children}
      </div>
    </section>
  );
}
