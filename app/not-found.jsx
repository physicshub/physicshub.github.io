// app/pages/error.jsx
import Button from "./components/Button.jsx"

export default function Error() {
    return(
        <div className="page-404">
            <h1>404</h1>
            <p>Oops! The page you are looking for does not exist. Please return to the main page and try again.</p>
            <Button content="Back to home" link = "/"/>
        </div>
    );
}