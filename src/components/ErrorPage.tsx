import { Link } from "react-router-dom";
import errorImage from "../assets/ErrorPage.webp";

export default function ErrorPage() {
  return (
    <div className="flex h-screen flex-col items-center justify-center overflow-hidden bg-linear-to-b from-primary-light via-white to-primary-light px-4 text-center">
      <div className="flex h-full w-full max-w-2xl flex-col items-center justify-center gap-4 py-6">
        <img src={errorImage} alt="Page not found" className="max-h-[45vh] w-full max-w-md shrink-0 object-contain drop-shadow-md" />

        <div className="flex shrink-0 flex-col items-center">
          <h1 className="mb-2 text-2xl font-extrabold text-primary md:text-3xl">Wrong Path!</h1>

          <p className="mb-4 max-w-md text-base leading-relaxed text-primary/70 md:text-lg">The page you are looking for does not exist. Check the URL or head back to the homepage.</p>

          <Link to="/" className="inline-flex items-center rounded-xl bg-primary px-8 py-3 text-base font-semibold text-white shadow-lg shadow-primary/20 transition hover:bg-primary-hover hover:shadow-primary/30 active:scale-[0.98]">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
