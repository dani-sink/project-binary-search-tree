import { Tree } from "./src/tree.js";

function getRandomArray(length = 5) {
  return Array.from({ length }, () => Math.floor(Math.random() * 100));
}

// 1. Create a binary search tree from an array of random numbers with each element having a value less than 100. You can create a function that returns an array of random numbers every time you call it if you wish.
const arr = getRandomArray(10);
const tree = Tree(arr);

// 2. Confirm that the tree is balanced by calling isBalanced().
console.log(tree.isBalanced());
console.log();

// 3. Print out all elements in level, pre, post, and in order.

// level-order print iterative
tree.levelOrderForEachIterative((val) => console.log(val));
console.log();

// level-order print recursive
tree.levelOrderForEachRecursive((val) => console.log(val));
console.log();

// pre-order print
tree.preOrderForEach((val) => console.log(val));
console.log();

// post-order print
tree.postOrderForEach((val) => console.log(val));
console.log();

// in-order print
tree.inOrderForEach((val) => console.log(val));
console.log();

// 4. Unbalance the tree by adding several numbers whose value is more than 100.
tree.insert(105);
tree.insert(205);
tree.insert(305);
tree.insert(405);
tree.insert(505);

// 5. Confirm that the tree is unbalanced by calling isBalanced().
console.log(tree.isBalanced());

// 6. Balance the tree by calling rebalance().
tree.rebalance();

// 7. Confirm that the tree is balanced by calling isBalanced().
console.log(tree.isBalanced());

// 8. Print out all elements in level, pre, post, and in order.
tree.levelOrderForEachIterative((val) => console.log(val));
console.log();
tree.levelOrderForEachRecursive((val) => console.log(val));
console.log();
tree.preOrderForEach((val) => console.log(val));
console.log();
tree.postOrderForEach((val) => console.log(val));
console.log();
tree.inOrderForEach((val) => console.log(val));
console.log();
