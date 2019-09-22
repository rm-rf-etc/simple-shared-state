export default (...exps) => {
    const result = exps.find((exp) => exp[0]);
    if (result && typeof result[1] === "function") return result[1]();
};
