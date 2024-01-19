let text = 'abc123' + 'cde9982';
const neverReassigned = {};
neverReassigned.name = 'cristian silva';
let tobeReassined = {};
tobeReassined = {
  name: 'lai'
};
tobeReassined.name = 1;
tobeReassined = 0;
tobeReassined = {
  name: 'lai'
};
text = '123';
const result = text.split('').map(letter => {
  return letter.toUpperCase();
}).join('.');
console.log(result);
