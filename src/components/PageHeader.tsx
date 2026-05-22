interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export default function PageHeader({ eyebrow, title, description, children }: PageHeaderProps) {
  return (
    <div className="page-hero">
      <div className="section-container relative z-10 !py-0">
        {eyebrow && (
          <p className="text-brand-primary font-bold text-xs tracking-[0.2em] uppercase mb-3">
            {eyebrow}
          </p>
        )}
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">{title}</h1>
        {description && (
          <p className="text-slate-300 text-base sm:text-lg max-w-2xl leading-relaxed">
            {description}
          </p>
        )}
        {children && <div className="mt-8">{children}</div>}
      </div>
    </div>
  );
}
