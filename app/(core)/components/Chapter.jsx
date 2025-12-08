// app/components/Chapter.jsx
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight } from '@fortawesome/free-solid-svg-icons'
import Tag from "./Tag.jsx"
import Link from 'next/link.js';

function Chapter(props) {
    return(
        <section id={props.id} className="chapter-card">
            <div className='chapter-card-overlay'>
                <div className="chapter-card-tags-container">
                    {props.tags.map((tag, idx) => (
                        <Tag tag={tag} key={tag.id || idx} />
                    ))}
                </div>
                <h2 className='text-2xl'>{props.isABlog ? `#${props.id} ${props.name}` : `Chapter ${props.id}: ${props.name}`}</h2>
                <p>{props.desc}</p>
                <Link href={props.link}>{props.isABlog ? "Go to blog" :  "Go to simulation"}
                    <FontAwesomeIcon icon={faArrowRight} style={{ marginLeft: '10px' }}/>
                </Link>
            </div>
        </section> 
    );
}

export default Chapter