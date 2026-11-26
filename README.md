# Binary Search Tree

A balanced binary search tree implemented from scratch in JavaScript, built for [The Odin Project](https://www.theodinproject.com/lessons/javascript-binary-search-trees). It builds a balanced tree from an array, supports insertion and deletion, has breadth-first and depth-first traversals, measures height and depth, and can detect and fix imbalance.

## What it demonstrates

- **Building a balanced BST** from an unsorted array: sort numerically, remove duplicates, then recursively pick the middle value as each subtree's root.
- **Insertion and deletion by walking the tree**, never by touching the original array. Delete handles all three cases: a leaf, a node with one child, and a node with two children (replaced by its in-order successor or predecessor).
- **Breadth-first traversal** (level order) using a queue, written both **iteratively and recursively**.
- **Depth-first traversals** (preorder, inorder, postorder) using recursion. Inorder traversal of a BST visits values in sorted order.
- **Height and depth** measured in edges, and a **balance check that tests every node**, not just the root.
- **Rebalancing** by collecting the values with a traversal and rebuilding.
- **Testing with Jest:** 108 tests, including seeded random insert/delete sequences checked against a JavaScript `Set` after every step.

## API

Create a tree by calling `Tree(array)`. It's a factory, so no `new`:

```js
import { Tree } from "./src/tree.js";

const tree = Tree([7, 3, 3, 1, 5, 2, 6, 4]); // sorted + deduplicated → 1..7
tree.insert(8);
tree.deleteItem(1);

tree.includes(5); // true
tree.inOrderForEach((v) => console.log(v)); // 2 3 4 5 6 7 8
tree.height(tree.getRoot().data); // 3
tree.isBalanced(); // true
```

| Method                                 | Description                                                                                |
| -------------------------------------- | ------------------------------------------------------------------------------------------ |
| `getRoot()`                            | Return the root node (`null` for an empty tree). Each node has `data`, `left` and `right`. |
| `includes(value)`                      | Return `true` if `value` is in the tree, else `false`.                                     |
| `insert(value)`                        | Add `value` as a new leaf in the correct position. Does nothing if it already exists.      |
| `deleteItem(value)`                    | Remove `value` from the tree. Does nothing if it isn't there.                              |
| `levelOrderForEachIterative(callback)` | Breadth-first traversal using a queue in a loop. Calls `callback` with each value.         |
| `levelOrderForEachRecursive(callback)` | Breadth-first traversal using recursion. Same output as the iterative version.             |
| `preOrderForEach(callback)`            | Depth-first: root, left, right.                                                            |
| `inOrderForEach(callback)`             | Depth-first: left, root, right (sorted order).                                             |
| `postOrderForEach(callback)`           | Depth-first: left, right, root.                                                            |
| `height(value)`                        | Number of edges from that node down to its deepest leaf, or `undefined` if not found.      |
| `depth(value)`                         | Number of edges from that node up to the root, or `undefined` if not found.                |
| `isBalanced()`                         | `true` if, for every node, the heights of its left and right subtrees differ by at most 1. |
| `rebalance()`                          | Rebuild the tree as balanced, keeping every value.                                         |

All traversal methods pass **values** (not nodes) to the callback and throw an error if no callback is given.

## Project structure

```
project-binary-search-tree/
├── src/
│   ├── node.js          # Node factory: { data, left, right }
│   └── tree.js          # Tree factory: build, insert, delete, traversals, height/depth, balance
├── tests/
│   └── tree.test.js     # Jest suite (108 tests)
├── index.js             # driver script
├── babel.config.cjs     # lets Jest run ES modules
├── eslint.config.js
└── package.json
```

## Running it

```bash
git clone https://github.com/dani-sink/project-binary-search-tree.git
cd project-binary-search-tree
npm install       # installs Jest, Babel, ESLint, Prettier
npm test          # run the test suite
node index.js     # run the driver script
```

The driver script follows the assignment steps. It builds a tree from random numbers under 100 and confirms it's balanced. It prints all four traversals, then adds several numbers over 100 to unbalance the tree and confirms that. Finally it rebalances, confirms balance again, and prints the traversals once more.

## What I learned

- why picking the middle value at every level guarantees a balanced tree
- the two-child delete case: swap in the in-order successor, then delete that node instead
- why isBalanced has to check every node, not just the root
- writing level order both ways: the queue does the bookkeeping that recursion's call stack does for depth-first

---

Part of [The Odin Project](https://www.theodinproject.com/) — Full Stack JavaScript path.
