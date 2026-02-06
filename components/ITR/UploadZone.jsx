'use client';

export default function UploadZone({ onUpload }) {
  function handleChange(e) {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
  }

  return (
    <div className="bg-[color:var(--lux-card)]/70 border-2 border-dashed border-[color:var(--lux-foreground-10)] rounded-lg p-16 text-center hover:border-[color:var(--lux-accent)]/60 transition cursor-pointer">
      <input type="file" accept=".pdf" onChange={handleChange} className="hidden" id="file-upload" />
      <label htmlFor="file-upload" className="cursor-pointer block">
        <div className="text-6xl mb-4">📄</div>
        <p className="text-xl font-semibold text-[color:var(--lux-accent)] mb-2">Click to upload PDF</p>
        <p className="text-[color:var(--lux-foreground-60)]">Form 16, AIS, or Bank Statement</p>
      </label>
    </div>
  );
}
