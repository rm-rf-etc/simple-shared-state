export default node => {
    let result;
    node.once(data => { result = data; });
    return result;
};
