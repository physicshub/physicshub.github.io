function Tag(props) {
    return (
        <span className={`tag tag${props.level.color}`}>{props.level.name}</span>
    );
}

export default Tag;