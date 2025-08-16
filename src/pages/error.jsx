import Footer from "../components/Footer.jsx"
import Button from "../components/Button.jsx"
import Header from "../components/Header.jsx"

export function Error() {
    return(
        <>
            <Header/>
            <div className="page-404">
                <h1>404</h1>
                <p>Oops! The page you are looking for does not exist. Please return to the main page and try again.</p>
                <Button content="Back to home" link = "/"/>
            </div>
            <Footer />
        </>
    );
}