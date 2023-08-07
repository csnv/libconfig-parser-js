const getTabs = function(indent = 0) {
    if (indent <= 0)
        return '';
        
    return new Array(indent).fill('\t').join('');
}

module.exports = { getTabs }