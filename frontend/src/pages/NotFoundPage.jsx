import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="text-center py-20 animate-fade-slide-up">
      <div className="font-heading text-8xl font-bold text-text-muted mb-4">404</div>
      <h1 className="font-heading text-3xl font-bold text-text-primary mb-2">
        PAGE NOT FOUND
      </h1>
      <p className="font-body text-base text-text-tertiary mb-8 max-w-md mx-auto">
        Looks like this play went out of bounds. Let's get you back on the field.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 font-heading text-sm uppercase tracking-[1px] font-bold px-8 py-3 rounded-xl text-white transition-all duration-300 hover:scale-105"
        style={{
          background: 'linear-gradient(135deg, #FF6B35, #FF4D6A)',
          boxShadow: '0 4px 24px rgba(255,107,53,0.3)',
        }}
      >
        Back to Leaderboard
      </Link>
    </div>
  )
}
