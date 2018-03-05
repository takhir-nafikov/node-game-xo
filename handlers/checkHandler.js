exports.checkDiagonal = (matrix, size, symb) => {
    let toright = true;
    let toleft = true;
    for (let i = 0; i < size; i++) {
        toright &= (matrix[i][i] == symb);
        toleft &= (matrix[size-i-1][i] == symb);
    }

    if (toright || toleft) return true;

    return false;
};

exports.checkLanes = (matrix, size, symb) => {
    let cols;
    let rows;
    for (let col = 0; col < size; col++) {
        cols = true;
        rows = true;
        for (let row = 0; row < size; row++) {
            cols &= (matrix[col][row] == symb);
            rows &= (matrix[row][col] == symb);
        }
        if (cols || rows) return true;
    }

    return false;
};
