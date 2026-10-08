import { Link } from "react-router-dom";
export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <h1 className="mb-2 text-3xl font-extrabold">
        This journey seems to have taken a different route.
      </h1>
      <p className="mb-6 text-neutral-500">
        The page you're looking for doesn't exist.
      </p>
      <div className="flex justify-center gap-2">
        <Link to="/" className="btn btn-primary">
          Go Home
        </Link>
        <Link to="/find" className="btn btn-ghost">
          Find a Journey
        </Link>
      </div>
    </div>
  );
}
