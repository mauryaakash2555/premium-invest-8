'use client';

export default function UploadZone({ onUpload }) {
  function handleChange(e) {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
  }

  return (
    <div className="bg-[#1a1a1a] border-2 border-dashed border-[#333333] rounded-lg p-16 text-center hover:border-[#d4af37] transition cursor-pointer">
      <input type="file" accept=".pdf" onChange={handleChange} className="hidden" id="file-upload" />
      <label htmlFor="file-upload" className="cursor-pointer block">
        <div className="text-6xl mb-4">📄</div>
        <p className="text-xl font-semibold text-[#d4af37] mb-2">Click to upload PDF</p>
        <p className="text-[#9ca3af]">Form 16, AIS, or Bank Statement</p>
      </label>
    </div>
  );
}
