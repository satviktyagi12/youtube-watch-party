import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <main className="not-found-page">
      <div className="not-found-container">
        <p className="not-found-code">404</p>

        <h1>Page Not Found</h1>

        <p>
          The page you are looking for does not
          exist.
        </p>

        <Link
          to="/"
          className="button button-primary"
        >
          Go Home
        </Link>
      </div>
    </main>
  );
};

export default NotFoundPage;