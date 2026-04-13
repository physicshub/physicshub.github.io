import Button from "./(core)/components/Button.jsx";
import useTranslation from "./(core)/hooks/useTranslation.ts";

export default function Error() {
  const { t, meta } = useTranslation();
  const isCompleted = meta?.completed || false;
  return (
    <div className={`page-404 ${isCompleted ? "notranslate" : ""}`}>
      <h1>404</h1>
      <p>
        {t(
          "Oops! The page you are looking for does not exist. Please return to the main page and try again."
        )}
      </p>
      <Button content={t("Back to home")} link="/" />
    </div>
  );
}
