function Tag(props) {
    return (
        <span className={`tag tag-${props.level.color}`} key={props.id}>{props.level.name}</span>
    );
}

export default Tag;