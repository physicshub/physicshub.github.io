import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight } from '@fortawesome/free-solid-svg-icons'
import { Link } from "react-router-dom"
import Tag from "./tag.jsx"

function Chapter(props) {
    return(
        <section id={props.id} className="chapter-card">
            <div className='chapter-card-overlay'>
                <div className="chapter-card-tags-container">
                    {props.tags.map((tag, idx) => (
                        <Tag level={tag} key={tag.id || idx} />
                    ))}
                </div>
                <h2>Capitolo {props.id}: {props.name}</h2>
                <p>{props.desc}</p>
                <Link to={props.link}>Go to simulation
                    <FontAwesomeIcon icon={faArrowRight} style={{ marginLeft: '10px' }}/>
                </Link>
            </div>
            <div className="chapter-card-stroke"/>
        </section>
    );
}

export default Chapter