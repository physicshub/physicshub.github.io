function TextInput(props){
    return(
        <div className="control-group">
            <label className="input-label">{props.label}</label>
            <input type="text" id="inputText" placeholder={props.placeholder} className="input-text"/>
        </div>
    );
}

export default TextInput