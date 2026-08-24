import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { ChevronDown, LogOut, Menu, Settings, User, X } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { logout } from "../../features/auth/authSlice";
import { useLogoutClientMutation } from "../../features/auth/authApi";
import logo from "../../assets/SwiftFix-Logo.svg";

const navLinks = [
  { to: "/", label: "الرئيسية", end: true },
  { to: "/workshops", label: "الورشات" },
  { to: "/ai-diagnosis", label: "تشخيص AI" },
  { to: "/about", label: "من نحن" },
  { to: "/contact", label: "تواصل معنا" },
];

const navLinkClass = ({ isActive }: { isActive: boolean }) => `text-sm font-medium transition-colors sm:text-base ${isActive ? "font-semibold text-secondary" : "text-primary/70 hover:text-primary"}`;

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  const [logoutClient] = useLogoutClientMutation();

  const closeMenu = () => setIsMenuOpen(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    let logoutMessage = "";

    try {
      const result = await logoutClient().unwrap();
      logoutMessage = result.message;
    } catch {
      // نكمّل الخروج المحلي حتى لو فشل الطلب
    } finally {
      dispatch(logout());
      closeMenu();
      navigate("/login", {
        state: logoutMessage ? { successMessage: logoutMessage } : undefined,
      });
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="SwiftFix Logo" className="h-10 w-auto" />
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className={navLinkClass}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button type="button" onClick={() => setIsDropdownOpen((open) => !open)} className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 transition hover:bg-primary-light">
                <span className="hidden text-sm font-medium text-primary sm:inline">{user.first_name}</span>
                <div className="flex size-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">{user.first_name[0]}</div>
                <ChevronDown className={`size-4 text-primary/60 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {isDropdownOpen && (
                <div className="absolute left-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-primary/10 bg-white shadow-lg">
                  <div className="flex items-center gap-3 border-b border-primary/10 px-4 py-3">
                    <div className="flex size-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">{user.first_name[0]}</div>
                    <span className="text-sm font-semibold text-primary">
                      {user.first_name} {user.last_name}
                    </span>
                  </div>

                  <div className="py-1">
                    <Link to="/profile" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-primary/80 transition hover:bg-primary-light">
                      <User className="size-4" />
                      عرض الملف الشخصي
                    </Link>
                    <button type="button" className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-primary/80 transition hover:bg-primary-light" onClick={() => setIsDropdownOpen(false)}>
                      <Settings className="size-4" />
                      الإعدادات
                    </button>
                  </div>

                  <div className="border-t border-primary/10 py-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        handleLogout();
                      }}
                      className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-sm text-secondary transition hover:bg-red-50"
                    >
                      <LogOut className="size-4" />
                      تسجيل الخروج
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden items-center gap-3 lg:flex">
              <Link to="/signup" className="rounded-lg border border-primary px-5 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary-light">
                إنشاء الحساب
              </Link>
              <Link to="/login" className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-hover">
                تسجيل الدخول
              </Link>
            </div>
          )}

          <button
            type="button"
            className="inline-flex items-center justify-center rounded-lg p-2 text-primary transition hover:bg-primary-light lg:hidden"
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-expanded={isMenuOpen}
            aria-label={isMenuOpen ? "إغلاق القائمة" : "فتح القائمة"}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="bg-white lg:hidden">
          <nav className="flex flex-col gap-1 px-4 py-4 sm:px-6">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) => `rounded-lg px-3 py-2.5 text-center text-base font-medium transition ${isActive ? "bg-primary-light font-semibold text-secondary" : "text-primary/70 hover:bg-primary-light hover:text-primary"}`}
                onClick={closeMenu}
              >
                {link.label}
              </NavLink>
            ))}

            {!user && (
              <div className="mt-3 flex flex-col gap-2 pt-3">
                <Link to="/signup" className="rounded-lg border border-primary px-3 py-2.5 text-center text-base font-semibold text-primary transition hover:bg-primary-light" onClick={closeMenu}>
                  إنشاء الحساب
                </Link>
                <Link to="/login" className="rounded-lg bg-primary px-3 py-2.5 text-center text-base font-semibold text-white transition hover:bg-primary-hover" onClick={closeMenu}>
                  تسجيل الدخول
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
