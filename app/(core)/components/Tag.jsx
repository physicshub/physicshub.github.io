function Tag({ tag = "", className = "" }) {
  return (
    <span className={`tag tag-${tag.color} ${className}`}>{tag.name}</span>
  );
}

export default Tag;
