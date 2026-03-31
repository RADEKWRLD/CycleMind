export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Brand */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden"
        style={{
          backgroundColor: "#ECE9E0",
          backgroundImage: `
            radial-gradient(ellipse 60% 40% at 80% 15%, rgba(250,93,41,0.1) 0%, transparent 50%),
            radial-gradient(ellipse 50% 50% at 10% 85%, rgba(120,140,93,0.06) 0%, transparent 50%)
          `,
        }}
      >
        {/* Noise grain */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04] mix-blend-multiply"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Topographic contour decoration */}
        <svg
          className="absolute top-1/2 left-1/2 -translate-x-[40%] -translate-y-1/2 pointer-events-none"
          width="520"
          height="520"
          viewBox="0 0 500 500"
          fill="none"
          aria-hidden="true"
        >
          {/* Central contour cluster */}
          <path
            d="M250 180C290 170 340 190 350 230C360 270 340 310 300 320C260 330 220 310 210 270C200 230 210 190 250 180Z"
            stroke="rgba(250,93,41,0.18)"
            strokeWidth="1"
          />
          <path
            d="M250 150C310 135 380 165 395 225C410 285 375 345 315 360C255 375 195 345 180 285C165 225 190 165 250 150Z"
            stroke="rgba(250,93,41,0.14)"
            strokeWidth="1"
          />
          <path
            d="M250 120C330 100 420 140 440 220C460 300 410 380 330 400C250 420 170 380 150 300C130 220 170 140 250 120Z"
            stroke="rgba(250,93,41,0.10)"
            strokeWidth="1"
          />
          <path
            d="M255 90C350 65 460 115 485 215C510 315 445 415 345 440C245 465 145 415 120 315C95 215 160 115 255 90Z"
            stroke="rgba(250,93,41,0.07)"
            strokeWidth="1"
          />
          <path
            d="M260 60C375 28 500 90 530 210C560 330 480 450 360 480C240 510 120 450 90 330C60 210 145 92 260 60Z"
            stroke="rgba(20,20,19,0.04)"
            strokeWidth="1"
          />
          {/* Offset secondary contour cluster */}
          <path
            d="M120 130C145 120 175 130 180 155C185 180 165 200 140 205C115 210 90 195 85 170C80 145 95 140 120 130Z"
            stroke="rgba(250,93,41,0.12)"
            strokeWidth="0.8"
          />
          <path
            d="M115 110C150 95 195 110 205 150C215 190 185 225 145 235C105 245 65 225 55 185C45 145 80 125 115 110Z"
            stroke="rgba(250,93,41,0.08)"
            strokeWidth="0.8"
          />
        </svg>


        {/* Horizontal rule accent */}
        <div className="absolute top-[38%] left-12 right-12 h-px bg-linear-to-r from-primary/20 via-primary/5 to-transparent pointer-events-none" />

        {/* Top — Brand */}
        <div className="relative z-10">
          <h1 className="text-2xl font-serif font-medium text-foreground tracking-normal">
            CycleMind
          </h1>
        </div>

        {/* Center — Editorial headline */}
        <div className="relative z-10 max-w-sm">
          <p className="text-xs font-sans font-medium text-primary tracking-[0.2em] uppercase mb-4">
            AI Software Design
          </p>
          <p className="text-4xl xl:text-[3.2rem] font-serif font-normal text-foreground leading-[1.2] tracking-tight">
            思考，
            <br />
            然后<span className="text-primary">创造</span>。
          </p>
          <div className="mt-8 w-12 h-0.5 bg-primary/40 rounded-full" />
          <p className="mt-6 text-sm text-muted-foreground font-serif leading-[1.8]">
            将你的想法化为架构蓝图。
            <br />
            从需求到系统设计，AI 与你协作完成。
          </p>
        </div>

        {/* Bottom — Footer */}
        <div className="relative z-10 flex items-center justify-between">
          <p className="text-xs text-muted-foreground/60">&copy; 2026 CycleMind</p>
          <a
            href="https://github.com/RADEKWRLD"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground/60 hover:text-primary transition-colors"
          >
            RADEKWRLD
          </a>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-surface-lowest">
        {children}
      </div>
    </div>
  );
}
