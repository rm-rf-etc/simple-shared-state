export default (...exps) => {
    const result = exps.find((exp) => exp[0]);
    if (result && typeof result[1] === "function") result[1]();
};
