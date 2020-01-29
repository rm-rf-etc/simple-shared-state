
export default (label, { n, min, max, mean, variance, standard_deviation }) => {
    let string = `${label}:\n`;
    string += `count: ${n}\n`;
    string += `min: ${min}\n`;
    string += `max: ${max}\n`;
    string += `variance: ${variance}\n`;
    string += `standard deviation: ${standard_deviation}\n`;
    string += `mean: ${mean}`;

    return string;
};
