import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Calendar, Flag, Heart, MessageCircle, Share2 } from "lucide-react";
import { useAddFavoriteShopMutation, useRemoveFavoriteShopMutation } from "../../auth/authApi";
import { useAppSelector } from "../../../store/hooks";
import type { AuthValidationErrorResponse } from "../../../types/authTypes";
import { useFavoriteShopLookup } from "../../favorites/useFavoriteShopLookup";
import type { WorkshopDetails } from "./types";
import { WorkshopComplaintDialog, useWorkshopComplaintLauncher } from "./WorkshopComplaintDialog";

type WorkshopDetailsContactSidebarProps = {
  workshop: WorkshopDetails;
};

function whatsAppChatUrl(phone: string, message: string) {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return "";
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function WorkshopDetailsContactSidebar({ workshop }: WorkshopDetailsContactSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const token = useAppSelector((state) => state.auth.token);
  const { lookup } = useFavoriteShopLookup();
  const [addFavoriteShop, { isLoading: isAddingFavorite }] = useAddFavoriteShopMutation();
  const [removeFavoriteShop, { isLoading: isRemovingFavorite }] = useRemoveFavoriteShopMutation();
  const [favoriteOverride, setFavoriteOverride] = useState<boolean | null>(null);
  const [favoriteError, setFavoriteError] = useState("");
  const [shareNotice, setShareNotice] = useState<{ message: string; isError: boolean } | null>(null);
  const { open, openComplaint, closeComplaint } = useWorkshopComplaintLauncher(workshop.id);
  const shopId = String(workshop.id);
  const chatUrl = whatsAppChatUrl(workshop.phone, `مرحباً، أتواصل معكم من منصة سويفت فيكس بخصوص ورشة ${workshop.name}.`);
  const isSaved = favoriteOverride ?? (lookup.ids.has(shopId) || lookup.names.has(workshop.name.trim()));
  const isSaving = isAddingFavorite || isRemovingFavorite;

  const toggleSaved = async () => {
    setFavoriteError("");

    if (!token) {
      navigate("/login", { state: { from: location.pathname } });
      return;
    }

    if (isSaving) return;

    try {
      if (isSaved) {
        await removeFavoriteShop(workshop.id).unwrap();
        setFavoriteOverride(false);
      } else {
        await addFavoriteShop(workshop.id).unwrap();
        setFavoriteOverride(true);
      }
    } catch (error) {
      const errorData = (error as { data?: AuthValidationErrorResponse })?.data;
      setFavoriteError(errorData?.message || (isSaved ? "تعذر إزالة الورشة من المفضلة." : "تعذر إضافة الورشة إلى المفضلة."));
    }
  };

  const shareWorkshop = async () => {
    const url = window.location.href;
    setShareNotice(null);

    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: workshop.name, url });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setShareNotice({ message: "تم نسخ رابط الورشة.", isError: false });
    } catch {
      setShareNotice({ message: "تعذر مشاركة الرابط.", isError: true });
    }
  };

  return (
    <aside className="flex flex-col gap-4">
      <div className="rounded border border-[#f5f5f5] bg-white p-4">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#ffefe4]">
            <MessageCircle className="size-4.5 text-secondary" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#2a2a2a]">تواصل مع الورشة</h2>
            <p className="mt-0.5 text-xs text-[#999]">يرد خلال &lt; 30 دقيقة عادةً</p>
          </div>
        </div>

        <div className="flex gap-3">
          <Link
            to={`/workshops/booking?shop_id=${encodeURIComponent(workshop.id)}&shop_name=${encodeURIComponent(workshop.name)}`}
            className="flex flex-1 items-center justify-center gap-1 rounded bg-primary px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-primary-hover"
          >
            <Calendar className="size-4 shrink-0" aria-hidden="true" />
            <span>إرسال طلب</span>
          </Link>
          {chatUrl ? (
            <a
              href={chatUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`ابدأ محادثة واتساب مع ${workshop.name}`}
              className="flex flex-1 items-center justify-center gap-1 rounded bg-primary-light px-4 py-2.5 text-[13px] font-semibold text-primary transition hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/40"
            >
              <MessageCircle className="size-4 shrink-0" aria-hidden="true" />
              <span>واتساب</span>
            </a>
          ) : null}
        </div>
      </div>

      {workshop.whyChooseItems.length > 0 ? (
        <div className="rounded bg-[#f5f5f5] p-4">
          <h3 className="mb-3 text-sm text-[#888]">{workshop.whyChooseTitle}</h3>
          <ul className="space-y-3">
            {workshop.whyChooseItems.map((item) => (
              <li key={item} className="flex items-center gap-2 text-xs text-[#666]">
                <span className="text-xs font-bold text-secondary" aria-hidden="true">
                  ✓
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => void shareWorkshop()}
            className="flex flex-1 items-center justify-center gap-1.5 rounded border border-[#f5f5f5] bg-white px-5 py-2.5 text-[13px] font-semibold text-[#333] transition hover:bg-primary-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/40"
          >
            <Share2 className="size-4 shrink-0" aria-hidden="true" />
            مشاركة
          </button>
          <button
            type="button"
            aria-pressed={isSaved}
            disabled={isSaving}
            onClick={() => void toggleSaved()}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded border px-5 py-2.5 text-[13px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/40 disabled:cursor-not-allowed disabled:opacity-70 ${
              isSaved ? "border-secondary/30 bg-[#fff2e9] text-secondary" : "border-[#f5f5f5] bg-white text-[#333] hover:bg-primary-light"
            }`}
          >
            <Heart className={`size-4 shrink-0 ${isSaved ? "fill-current" : ""}`} aria-hidden="true" />
            {isSaved ? "محفوظ" : "حفظ"}
          </button>
        </div>
        {shareNotice ? (
          <p className={`text-xs ${shareNotice.isError ? "text-red-700" : "text-emerald-700"}`} role="status">
            {shareNotice.message}
          </p>
        ) : null}
        {favoriteError ? (
          <p className="text-xs text-red-700" role="alert">
            {favoriteError}
          </p>
        ) : null}
        <button
          type="button"
          onClick={openComplaint}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded border border-red-100 bg-white px-5 py-2.5 text-[13px] font-semibold text-red-600 transition hover:bg-red-50"
        >
          <Flag className="size-4 shrink-0" aria-hidden="true" />
          تقديم شكوى
        </button>
      </div>

      <WorkshopComplaintDialog shopId={workshop.id} shopName={workshop.name} open={open} onClose={closeComplaint} />
    </aside>
  );
}
