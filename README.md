1. What is the difference between var, let, and const?
Ans:
i) var: It is the old way to declare variables. It has functional scope, meaning it can be accessed anywhere inside a function. We can re-declare and update it.
ii) let: Introduced in ES6. It has block scope works only inside the { } where it is defined. We can update the value but cannot re-declare it with the same name.
iii) const: Also introduced in ES6 and has block scope. But unlike let, we cannot update or re-declare a const variable. It stays constant.

2. What is the spread operator (...)?
Ans: The spread operator is written with three dots ' ... ' . It is used to copy or merge arrays and objects easily. For example, if I have an array arr1 = [1, 2] and I want to put it in a new array, I can write let newArr = [...arr1, 3, 4]. This helps avoid changing the original array directly.

3. What is the difference between map(), filter(), and forEach()?
Ans:
i) forEach( ): It runs a loop over an array and does some action for every item, but it does not return a new array.
ii) map( ): It also loops through an array, but it changes the data and gives us a completely new array with the same length.
iii) filter( ): It checks a condition inside the array. It returns a new array but only with the items that pass that condition like filtering "Open" issues.

4. What is an arrow function?
Ans: An arrow function is a shorter way to write normal functions in JavaScript. It uses the "=>" symbol. Example: 
Instead of writing function add(a, b) { return a + b; }
We can simply write: const add = (a, b) => a + b;

5. What are template literals?
Ans: Template literals allow us to write strings using backticks (`) instead of normal quotes. It makes it very easy to mix variables inside a text using ${variable_name}. It also lets us write multiple lines of string without breaking the code, which I used a lot to create the HTML cards in JavaScript.