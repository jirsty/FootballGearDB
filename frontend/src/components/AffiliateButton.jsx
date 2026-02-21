export default function AffiliateButton({ url, label = 'Buy Now', size = 'sm' }) {
  if (!url) return null

  const isLg = size === 'lg'

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      data-affiliate-click
      className={`inline-flex items-center gap-1.5 font-heading uppercase tracking-[1px] font-bold text-white rounded-xl transition-all duration-300 hover:scale-105 ${
        isLg ? 'px-8 py-3 text-sm' : 'px-4 py-1.5 text-[11px]'
      }`}
      style={{
        background: 'linear-gradient(135deg, #FF6B35, #FF4D6A)',
        boxShadow: isLg ? '0 4px 24px rgba(255,107,53,0.3)' : '0 2px 12px rgba(255,107,53,0.2)',
      }}
    >
      {label}
      <svg className={isLg ? 'w-4 h-4' : 'w-3 h-3'} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
      </svg>
    </a>
  )
}
