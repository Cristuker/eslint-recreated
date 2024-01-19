let text = "abc123" + "cde9982"
var neverReassigned = {};
neverReassigned.name = "cristian silva"

var tobeReassined = {}
tobeReassined = { name: "lai" }
tobeReassined.name = 1
tobeReassined = 0
tobeReassined = { name: "lai" }
// text = "123"
text = "123"
// text = "123"
// text = "123"

let result = text.split("").map(letter => {
    return letter.toUpperCase()
}).join(".")
console.log(result)