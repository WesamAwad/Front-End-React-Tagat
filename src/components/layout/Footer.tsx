import { Link } from "react-router-dom";
import logo from "../../assets/SwiftFix-Logo2.png";
import instagramIcon from "../../assets/footer/instagram.svg";
import facebookIcon from "../../assets/footer/facebook.svg";
import linkedinIcon from "../../assets/footer/linkedin.svg";
import xIcon from "../../assets/footer/x.svg";

const companyLinks = [
  { label: "من نحن", to: "/about" },
  { label: "فريق العمل", to: "#" },
  { label: "المدونة", to: "#" },
  { label: "الوظائف", to: "#" },
];

const servicesLinks = [
  { label: "إصلاح الهواتف", to: "/workshops" },
  { label: "إصلاح اللابتوب", to: "/workshops" },
  { label: "إصلاح الأجهزة المنزلية", to: "/workshops" },
  { label: "خدمة الطوارئ", to: "/contact" },
];

const workshopsLinks = [
  { label: "انضم إلينا", to: "/signup/workshop" },
  { label: "لوحة التحكم", to: "/workshop-owner" },
  { label: "الأسعار والباقات", to: "#" },
  { label: "الدعم الفني", to: "/contact" },
];

const contactLinks = [
  { label: "اتصل بنا", to: "/contact" },
  { label: "مركز المساعدة", to: "#" },
  { label: "سياسة الخصوصية", to: "#" },
  { label: "الشروط والأحكام", to: "#" },
];

const legalLinks = [
  { label: "سياسة الخصوصية", to: "#" },
  { label: "الشروط والأحكام", to: "#" },
  { label: "ملفات تعريف الارتباط", to: "#" },
];

const socialLinks = [
  { label: "Instagram", href: "#", icon: instagramIcon },
  { label: "Facebook", href: "#", icon: facebookIcon },
  { label: "LinkedIn", href: "#", icon: linkedinIcon },
  { label: "X", href: "#", icon: xIcon },
];

function FooterColumn({ title, links }: { title: string; links: { label: string; to: string }[] }) {
  return (
    <div className="flex flex-col items-center gap-3 text-center lg:items-start lg:text-start">
      <p className="text-[13px] font-bold leading-normal text-white">{title}</p>
      <ul className="flex flex-col items-center gap-3 lg:items-start">
        {links.map((link) => (
          <li key={link.label}>
            <Link to={link.to} className="text-[13px] font-normal leading-normal text-gray-300 transition hover:text-secondary">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="mt-10 w-full bg-primary sm:mt-12">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-20">
        <div className="grid grid-cols-1 place-items-center gap-8 md:grid-cols-2 lg:grid-cols-5 lg:place-items-start lg:gap-6">
          {/* البراند — يظهر يمين في RTL */}
          <div className="flex flex-col items-center gap-3 text-center md:col-span-2 lg:col-span-1 lg:items-start lg:text-start">
            <Link to="/" className="inline-flex w-fit lg:mx-0" aria-label="SwiftFix">
              <img src={logo} alt="SwiftFix" className="h-14 w-auto object-contain sm:h-16 lg:h-20" />
            </Link>

            <p className="max-w-66 text-[13px] font-normal leading-relaxed text-white">منصة تربط العملاء بأفضل ورش إصلاح الأجهزة الإلكترونية</p>

            <div className="flex items-center justify-center gap-2 pt-2 lg:justify-start">
              {socialLinks.map((social) => (
                <a key={social.label} href={social.href} aria-label={social.label} className="flex size-8 items-center justify-center rounded bg-white transition hover:opacity-90">
                  <img src={social.icon} alt="" className="size-3.5 object-contain" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          <FooterColumn title="الشركة" links={companyLinks} />
          <FooterColumn title="الخدمات" links={servicesLinks} />
          <FooterColumn title="للورش" links={workshopsLinks} />
          <FooterColumn title="التواصل" links={contactLinks} />
        </div>

        <div className="mt-6 h-px w-full bg-[#e0e0e0]" aria-hidden="true" />

        <div className="mt-6 flex flex-col items-center gap-4 text-center md:flex-row md:items-center md:justify-between md:text-start">
          {/* في RTL: الروابط يمين والحقوق يسار */}
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 md:justify-start">
            {legalLinks.map((link) => (
              <Link key={link.label} to={link.to} className="text-xs font-normal leading-normal text-gray-300 transition hover:text-secondary">
                {link.label}
              </Link>
            ))}
          </div>

          <p className="text-xs font-normal leading-normal text-white">© 2025 سويفت فيكس. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </footer>
  );
}
