import Footer from "../components/Footer.jsx"
import Button from "../components/Button.jsx"

export function Error() {
    return(
        <>
            <div className="page-404">
                <h1>404</h1>
                <p>Ops! La pagina che stai cercando non esiste. Torna al portale principale e riprova.</p>
                <Button content="Torna alla Home" link = "/"/>
            </div>
            <Footer />
        </>
    );
}