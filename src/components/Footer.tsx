import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-brand-border mt-auto">
      <div className="section-container py-10">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          <a href="https://animalcare360.com" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <Image src="/user-icon.png" alt="AnimalCare360" width={36} height={36} />
            <div>
              <p className="font-bold text-brand-navy">
                AnimalCare<span className="text-brand-primary">360</span>
              </p>
              <p className="text-xs text-brand-muted mt-0.5">Enterprise portal · Hulm Solutions</p>
            </div>
          </a>
          <div className="flex flex-wrap gap-8 text-sm text-brand-muted font-medium">
            <Link href="/" className="hover:text-brand-navy transition-colors">Explore CattlePro</Link>
            <Link href="/login" className="hover:text-brand-navy transition-colors">Sign In</Link>
            <Link href="/register" className="hover:text-brand-navy transition-colors">Register</Link>
            <a href="https://animalcare360.com" className="hover:text-brand-navy transition-colors">
              Marketing Site
            </a>
          </div>
        </div>
        <p className="text-[10px] font-bold text-brand-muted uppercase tracking-widest mt-8 pt-6 border-t border-brand-border">
          © {new Date().getFullYear()} AnimalCare360 · FBR-compliant · Cloud ERP for Pakistan
        </p>
      </div>
    </footer>
  );
}
