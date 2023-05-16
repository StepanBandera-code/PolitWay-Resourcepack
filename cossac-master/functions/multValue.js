module.exports = function (arr, value) { 
    return value.every(value => {
        return arr.includes(value); 
    })
};

//Simple function that checks if array has all of the items