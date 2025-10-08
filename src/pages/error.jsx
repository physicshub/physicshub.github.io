import Footer from "../components/Footer.jsx"
import Button from "../components/Button.jsx"
import Header from "../components/Header.jsx"
import Stars from "../components/Stars.jsx";
import GradientBackground from "../components/GradientBackground.jsx";

export function Error() {
    return(
        <>
            <Header/>
            <Stars color="var(--accent-color)" opacity={0.4} starDensity={0.005}/>
            <GradientBackground/>
            <div className="page-404">
                <h1>404</h1>
                <p>Oops! The page you are looking for does not exist. Please return to the main page and try again.</p>
                <Button content="Back to home" link = "/"/>
            </div>
            <Footer />
        </>
    );
}