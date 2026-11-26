import { Tree } from "../src/tree.js";

// Adjust ONLY these two lines if your design differs.
const makeTree = (arr) => Tree(arr);
const rootValue = (tree) => tree.getRoot().data; // ← .value if that's your Node field

// Collect the values a traversal passes to its callback, in order.
const collect = (tree, method) => {
  const out = [];
  tree[method]((v) => out.push(v));
  return out;
};
const inOrder = (tree) => collect(tree, "inOrderForEach");

const LEVEL_ORDERS = [
  "levelOrderForEachIterative",
  "levelOrderForEachRecursive",
];
const ALL_TRAVERSALS = [
  ...LEVEL_ORDERS,
  "inOrderForEach",
  "preOrderForEach",
  "postOrderForEach",
];

// Build a tree by inserting values one at a time (shape depends on insert order).
const fromInserts = (values) => {
  const tree = makeTree([]);
  values.forEach((v) => tree.insert(v));
  return tree;
};

// [a, a+1, ..., b]
const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);

const sortedUnique = (arr) => [...new Set(arr)].sort((a, b) => a - b);

// Height (in edges) of the shortest possible tree holding n nodes.
const minHeight = (n) => Math.ceil(Math.log2(n + 1)) - 1;

// Tiny seeded random generator, so the "random" tests are repeatable.
const rng = (seed) => () =>
  (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;

// [1..7] builds a PERFECT tree, so its shape is unambiguous:
//         4
//       /   \
//      2     6
//     / \   / \
//    1   3 5   7
const SEVEN = [1, 2, 3, 4, 5, 6, 7];

describe("buildTree (via Tree constructor)", () => {
  test("sorts and removes duplicates", () => {
    const tree = makeTree([7, 3, 3, 1, 5, 5, 2, 6, 4, 4]);
    expect(inOrder(tree)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  test("sorts NUMERICALLY, not alphabetically", () => {
    // default .sort() would give [1, 10, 100, 2, 9]
    const tree = makeTree([10, 9, 100, 2, 1]);
    expect(inOrder(tree)).toEqual([1, 2, 9, 10, 100]);
  });

  test("root is the middle value, so the tree starts balanced", () => {
    const tree = makeTree(SEVEN);
    expect(rootValue(tree)).toBe(4);
    expect(tree.isBalanced()).toBe(true);
  });

  test("does not depend on the original array after construction", () => {
    const arr = [1, 2, 3];
    const tree = makeTree(arr);
    arr.push(99); // mutate the input
    expect(tree.includes(99)).toBe(false);
  });

  test("single-element array → that element is the root", () => {
    const tree = makeTree([42]);
    expect(rootValue(tree)).toBe(42);
    expect(inOrder(tree)).toEqual([42]);
    expect(tree.height(42)).toBe(0);
    expect(tree.depth(42)).toBe(0);
  });

  test("array of all duplicates → one node", () => {
    const tree = makeTree([5, 5, 5, 5]);
    expect(inOrder(tree)).toEqual([5]);
  });

  test("reverse-sorted input builds the same tree as sorted input", () => {
    const tree = makeTree([7, 6, 5, 4, 3, 2, 1]);
    expect(collect(tree, "preOrderForEach")).toEqual([4, 2, 1, 3, 6, 5, 7]);
  });

  test("handles negative numbers and zero", () => {
    const tree = makeTree([0, -5, 3, -1, 8, -10]);
    expect(inOrder(tree)).toEqual([-10, -5, -1, 0, 3, 8]);
    expect(tree.includes(-5)).toBe(true);
  });

  test("handles decimals", () => {
    const tree = makeTree([1.5, 0.25, 3.75, 2]);
    expect(inOrder(tree)).toEqual([0.25, 1.5, 2, 3.75]);
  });

  test("even-length input is still balanced", () => {
    const tree = makeTree([1, 2, 3, 4, 5, 6]);
    expect(tree.isBalanced()).toBe(true);
    expect(inOrder(tree)).toEqual([1, 2, 3, 4, 5, 6]);
  });

  test("1000 values → balanced, with the minimum possible height", () => {
    const tree = makeTree(range(1, 1000));
    expect(tree.isBalanced()).toBe(true);
    expect(tree.height(rootValue(tree))).toBe(minHeight(1000)); // 9
  });

  test("two trees don't share state", () => {
    const a = makeTree([1, 2, 3]);
    const b = makeTree([10, 20, 30]);
    a.insert(4);
    b.deleteItem(20);
    expect(inOrder(a)).toEqual([1, 2, 3, 4]);
    expect(inOrder(b)).toEqual([10, 30]);
  });
});

describe("empty tree", () => {
  let tree;
  beforeEach(() => {
    tree = makeTree([]);
  });

  test("root is null", () => {
    expect(tree.getRoot()).toBeNull();
  });

  test("includes is false and traversals visit nothing", () => {
    expect(tree.includes(1)).toBe(false);
    for (const method of ALL_TRAVERSALS) {
      expect(collect(tree, method)).toEqual([]);
    }
  });

  test("is balanced", () => {
    expect(tree.isBalanced()).toBe(true);
  });

  test("insert into an empty tree works", () => {
    tree.insert(5);
    expect(tree.includes(5)).toBe(true);
    expect(inOrder(tree)).toEqual([5]);
    expect(rootValue(tree)).toBe(5);
  });

  test("deleteItem on an empty tree does nothing (and doesn't crash)", () => {
    expect(() => tree.deleteItem(1)).not.toThrow();
    expect(tree.getRoot()).toBeNull();
  });

  test("height and depth are undefined", () => {
    expect(tree.height(1)).toBeUndefined();
    expect(tree.depth(1)).toBeUndefined();
  });

  test("rebalance on an empty tree doesn't crash", () => {
    expect(() => tree.rebalance()).not.toThrow();
    expect(tree.getRoot()).toBeNull();
    expect(tree.isBalanced()).toBe(true);
  });

  test("traversals still require a callback", () => {
    for (const method of ALL_TRAVERSALS) {
      expect(() => tree[method]()).toThrow(/callback/i);
    }
  });
});

describe("includes", () => {
  const tree = makeTree(SEVEN);

  test("true for values in the tree", () => {
    for (const v of SEVEN) expect(tree.includes(v)).toBe(true);
  });

  test("false for values not in the tree", () => {
    expect(tree.includes(0)).toBe(false);
    expect(tree.includes(8)).toBe(false);
    expect(tree.includes(3.5)).toBe(false);
  });

  test("false for values just outside the range", () => {
    expect(tree.includes(-1)).toBe(false);
    expect(tree.includes(1000)).toBe(false);
  });

  test("does not change the tree", () => {
    tree.includes(4);
    tree.includes(99);
    expect(inOrder(tree)).toEqual(SEVEN);
  });
});

describe("insert", () => {
  let tree;
  beforeEach(() => {
    tree = makeTree(SEVEN);
  });

  test("adds a value and keeps the BST order", () => {
    tree.insert(8);
    tree.insert(0);
    expect(tree.includes(8)).toBe(true);
    expect(tree.includes(0)).toBe(true);
    expect(inOrder(tree)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
  });

  test("inserting a duplicate does nothing", () => {
    tree.insert(4);
    tree.insert(7);
    expect(inOrder(tree)).toEqual(SEVEN);
  });

  test("a new value lands as a LEAF in the right spot (larger than all → right of 7)", () => {
    tree.insert(8);
    expect(collect(tree, "levelOrderForEachIterative")).toEqual([
      4, 2, 6, 1, 3, 5, 7, 8,
    ]);
    expect(tree.depth(8)).toBe(3);
    expect(tree.height(8)).toBe(0);
  });

  test("a value between two nodes goes into the gap (3.5 → right child of 3)", () => {
    tree.insert(3.5);
    // preorder shows 3.5 directly under 3, before we move on to 6
    expect(collect(tree, "preOrderForEach")).toEqual([
      4, 2, 1, 3, 3.5, 6, 5, 7,
    ]);
  });

  test("inserting doesn't change the root", () => {
    tree.insert(100);
    tree.insert(-100);
    expect(rootValue(tree)).toBe(4);
  });

  test("a duplicate insert doesn't change the shape either", () => {
    tree.insert(5);
    expect(collect(tree, "preOrderForEach")).toEqual([4, 2, 1, 3, 6, 5, 7]);
    expect(tree.height(5)).toBe(0);
  });

  test("ascending inserts into an empty tree make a chain", () => {
    const chain = fromInserts([1, 2, 3, 4, 5]);
    expect(rootValue(chain)).toBe(1);
    expect(chain.height(1)).toBe(4);
    expect(chain.depth(5)).toBe(4);
    expect(chain.isBalanced()).toBe(false);
  });

  test("descending inserts into an empty tree make a left chain", () => {
    const chain = fromInserts([5, 4, 3, 2, 1]);
    expect(rootValue(chain)).toBe(5);
    expect(chain.depth(1)).toBe(4);
    expect(inOrder(chain)).toEqual([1, 2, 3, 4, 5]);
  });

  test("many inserts keep the BST order", () => {
    const values = [50, 30, 70, 20, 40, 60, 80, 35, 45, 65];
    const t = fromInserts(values);
    expect(inOrder(t)).toEqual(sortedUnique(values));
  });
});

describe("deleteItem", () => {
  let tree;
  beforeEach(() => {
    tree = makeTree(SEVEN);
  });

  test("deletes a leaf", () => {
    tree.deleteItem(1);
    expect(tree.includes(1)).toBe(false);
    expect(inOrder(tree)).toEqual([2, 3, 4, 5, 6, 7]);
  });

  test("deletes a node with one child", () => {
    tree.deleteItem(1); // now 2 has only one child (3)
    tree.deleteItem(2);
    expect(tree.includes(2)).toBe(false);
    expect(tree.includes(3)).toBe(true); // the child survives
    expect(inOrder(tree)).toEqual([3, 4, 5, 6, 7]);
  });

  test("deletes a node whose only child is on the LEFT", () => {
    tree.deleteItem(3); // now 2 has only a left child (1)
    tree.deleteItem(2);
    expect(tree.includes(1)).toBe(true);
    expect(inOrder(tree)).toEqual([1, 4, 5, 6, 7]);
    expect(tree.depth(1)).toBe(1); // 1 moved up into 2's old spot
  });

  test("deletes a node whose only child is on the RIGHT", () => {
    tree.deleteItem(1); // now 2 has only a right child (3)
    tree.deleteItem(2);
    expect(tree.depth(3)).toBe(1); // 3 moved up into 2's old spot
  });

  test("deletes a node with two children", () => {
    tree.deleteItem(6);
    expect(tree.includes(6)).toBe(false);
    expect(inOrder(tree)).toEqual([1, 2, 3, 4, 5, 7]);
  });

  test("deletes the root", () => {
    tree.deleteItem(4);
    expect(tree.includes(4)).toBe(false);
    expect(inOrder(tree)).toEqual([1, 2, 3, 5, 6, 7]);
  });

  test("the root's replacement is its in-order successor (5) or predecessor (3)", () => {
    tree.deleteItem(4);
    expect([3, 5]).toContain(rootValue(tree));
  });

  test("deleting a two-child node whose replacement has its own child keeps that child", () => {
    tree.insert(5.5); // successor 5 now has a right child
    tree.insert(3.5); // predecessor 3 now has a right child too
    tree.deleteItem(4);
    expect(inOrder(tree)).toEqual([1, 2, 3, 3.5, 5, 5.5, 6, 7]);
    expect(tree.includes(5.5)).toBe(true);
    expect(tree.includes(3.5)).toBe(true);
  });

  test("deleting a missing value does nothing", () => {
    tree.deleteItem(42);
    expect(inOrder(tree)).toEqual(SEVEN);
  });

  test("deleting the same value twice is safe", () => {
    tree.deleteItem(3);
    tree.deleteItem(3);
    expect(inOrder(tree)).toEqual([1, 2, 4, 5, 6, 7]);
  });

  test("deleting every value leaves an empty tree", () => {
    for (const v of SEVEN) tree.deleteItem(v);
    expect(inOrder(tree)).toEqual([]);
    expect(tree.includes(4)).toBe(false);
    expect(tree.getRoot()).toBeNull();
  });

  test("deleting in reverse order also empties it", () => {
    for (const v of [...SEVEN].reverse()) tree.deleteItem(v);
    expect(tree.getRoot()).toBeNull();
  });

  test("deleting the only node empties the tree", () => {
    const one = makeTree([9]);
    one.deleteItem(9);
    expect(one.getRoot()).toBeNull();
    expect(one.includes(9)).toBe(false);
  });

  test("deleting a root that has only one child promotes the child", () => {
    const two = makeTree([1, 2]); // root is 1 or 2 depending on your midpoint
    const root = rootValue(two);
    const other = root === 1 ? 2 : 1;
    two.deleteItem(root);
    expect(rootValue(two)).toBe(other);
    expect(inOrder(two)).toEqual([other]);
  });

  test("a deleted value can be inserted again", () => {
    tree.deleteItem(6);
    tree.insert(6);
    expect(tree.includes(6)).toBe(true);
    expect(inOrder(tree)).toEqual(SEVEN);
  });

  test("works on a chain (each node has one child)", () => {
    const chain = fromInserts([1, 2, 3, 4, 5]);
    chain.deleteItem(3);
    expect(inOrder(chain)).toEqual([1, 2, 4, 5]);
    expect(chain.depth(4)).toBe(2);
  });
});

describe("traversals", () => {
  const tree = makeTree(SEVEN);

  test("levelOrderForEach visits level by level, left to right", () => {
    for (const method of LEVEL_ORDERS) {
      expect(collect(tree, method)).toEqual([4, 2, 6, 1, 3, 5, 7]);
    }
  });

  test("preOrderForEach: root, left, right", () => {
    expect(collect(tree, "preOrderForEach")).toEqual([4, 2, 1, 3, 6, 5, 7]);
  });

  test("inOrderForEach: left, root, right (sorted)", () => {
    expect(collect(tree, "inOrderForEach")).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  test("postOrderForEach: left, right, root", () => {
    expect(collect(tree, "postOrderForEach")).toEqual([1, 3, 2, 5, 7, 6, 4]);
  });

  test("callbacks receive VALUES, not nodes", () => {
    for (const method of ALL_TRAVERSALS) {
      collect(tree, method).forEach((v) => {
        expect(typeof v).toBe("number");
      });
    }
  });

  test.each(ALL_TRAVERSALS)(
    "%s calls the callback exactly once per node",
    (method) => {
      const callback = jest.fn();
      tree[method](callback);
      expect(callback).toHaveBeenCalledTimes(7);
    },
  );

  test.each(ALL_TRAVERSALS)("%s throws when no callback is given", (method) => {
    expect(() => tree[method]()).toThrow(/callback/i);
  });

  test("traversing doesn't change the tree", () => {
    for (const method of ALL_TRAVERSALS) collect(tree, method);
    expect(inOrder(tree)).toEqual(SEVEN);
    expect(rootValue(tree)).toBe(4);
  });

  test("single-node tree: every traversal visits just that node", () => {
    const one = makeTree([9]);
    for (const method of ALL_TRAVERSALS) {
      expect(collect(one, method)).toEqual([9]);
    }
  });

  test("right chain: level order and preorder go top-down, postorder bottom-up", () => {
    const chain = fromInserts([1, 2, 3, 4]);
    for (const method of LEVEL_ORDERS) {
      expect(collect(chain, method)).toEqual([1, 2, 3, 4]);
    }
    expect(collect(chain, "preOrderForEach")).toEqual([1, 2, 3, 4]);
    expect(collect(chain, "postOrderForEach")).toEqual([4, 3, 2, 1]);
  });

  test("traversals reflect inserts and deletes", () => {
    const t = makeTree(SEVEN);
    t.insert(8);
    t.deleteItem(1);
    expect(collect(t, "levelOrderForEachIterative")).toEqual([
      4, 2, 6, 3, 5, 7, 8,
    ]);
    expect(collect(t, "postOrderForEach")).toEqual([3, 2, 5, 8, 7, 6, 4]);
  });

  test("iterative and recursive level order always agree", () => {
    const shapes = [
      makeTree(range(1, 20)),
      fromInserts([10, 5, 15, 3, 7, 20, 1]),
      fromInserts([1, 2, 3, 4, 5]),
      fromInserts([5, 4, 3, 2, 1]),
    ];
    for (const t of shapes) {
      expect(collect(t, "levelOrderForEachRecursive")).toEqual(
        collect(t, "levelOrderForEachIterative"),
      );
    }
  });
});

describe("height (edges down to the deepest leaf)", () => {
  let tree;
  beforeEach(() => {
    tree = makeTree(SEVEN);
  });

  test("heights in a perfect tree", () => {
    expect(tree.height(4)).toBe(2); // root
    expect(tree.height(2)).toBe(1);
    expect(tree.height(6)).toBe(1);
    expect(tree.height(1)).toBe(0); // leaf
  });

  test("every leaf has height 0", () => {
    for (const leaf of [1, 3, 5, 7]) expect(tree.height(leaf)).toBe(0);
  });

  test("grows when a deeper leaf is added below the node", () => {
    tree.insert(8); // 7 → 8
    expect(tree.height(7)).toBe(1);
    expect(tree.height(4)).toBe(3);
  });

  test("uses the LONGEST path, not the left or right one", () => {
    tree.insert(8);
    tree.insert(9); // right side of 6 is now 2 levels deeper than its left
    expect(tree.height(6)).toBe(3);
    expect(tree.height(4)).toBe(4);
    expect(tree.height(2)).toBe(1); // left side unaffected
  });

  test("shrinks after the deepest leaf is deleted", () => {
    tree.insert(8);
    expect(tree.height(4)).toBe(3);
    tree.deleteItem(8);
    expect(tree.height(4)).toBe(2);
  });

  test("undefined for a value not in the tree", () => {
    expect(tree.height(99)).toBeUndefined();
  });

  test("undefined for a value that was deleted", () => {
    tree.deleteItem(3);
    expect(tree.height(3)).toBeUndefined();
  });

  test("chain of n nodes has root height n - 1", () => {
    const chain = fromInserts(range(1, 6));
    expect(chain.height(1)).toBe(5);
    expect(chain.height(6)).toBe(0);
  });
});

describe("depth (edges up to the root)", () => {
  let tree;
  beforeEach(() => {
    tree = makeTree(SEVEN);
  });

  test("depths in a perfect tree", () => {
    expect(tree.depth(4)).toBe(0); // root
    expect(tree.depth(2)).toBe(1);
    expect(tree.depth(7)).toBe(2);
  });

  test("nodes on the same level share a depth", () => {
    for (const v of [2, 6]) expect(tree.depth(v)).toBe(1);
    for (const v of [1, 3, 5, 7]) expect(tree.depth(v)).toBe(2);
  });

  test("a newly inserted leaf has the right depth", () => {
    tree.insert(8);
    expect(tree.depth(8)).toBe(3);
  });

  test("undefined for a value not in the tree", () => {
    expect(tree.depth(99)).toBeUndefined();
  });

  test("undefined for a value that was deleted", () => {
    tree.deleteItem(7);
    expect(tree.depth(7)).toBeUndefined();
  });

  test("changes after rebalancing", () => {
    const chain = fromInserts(range(1, 7));
    expect(chain.depth(7)).toBe(6);
    chain.rebalance();
    expect(chain.depth(7)).toBe(2);
    expect(chain.depth(4)).toBe(0); // new root
  });

  test("depth(v) + height(v) never exceeds the root's height", () => {
    const t = fromInserts([50, 30, 70, 20, 40, 60, 80, 35, 45, 65, 10]);
    const rootHeight = t.height(rootValue(t));
    for (const v of inOrder(t)) {
      expect(t.depth(v) + t.height(v)).toBeLessThanOrEqual(rootHeight);
    }
  });
});

describe("isBalanced", () => {
  test("true right after building", () => {
    expect(makeTree(SEVEN).isBalanced()).toBe(true);
  });

  test("single node and two nodes are balanced", () => {
    expect(makeTree([1]).isBalanced()).toBe(true);
    expect(makeTree([1, 2]).isBalanced()).toBe(true);
  });

  test("a height difference of exactly 1 still counts as balanced", () => {
    const tree = makeTree(SEVEN);
    tree.insert(8); // 7 gets one child; no node differs by more than 1
    expect(tree.isBalanced()).toBe(true);
  });

  test("a height difference of 2 is unbalanced", () => {
    const tree = makeTree(SEVEN);
    tree.insert(8);
    tree.insert(9); // under 7: left height -1, right height 1
    expect(tree.isBalanced()).toBe(false);
  });

  test("false after a long chain is added on one side", () => {
    const tree = makeTree(SEVEN);
    [8, 9, 10].forEach((v) => tree.insert(v)); // 7 → 8 → 9 → 10
    expect(tree.isBalanced()).toBe(false);
  });

  test("checks EVERY node, not just the root (the spec pitfall)", () => {
    const tree = makeTree(SEVEN);
    // deepen both sides equally so the ROOT looks balanced...
    [0, -1].forEach((v) => tree.insert(v)); // left:  1 → 0 → -1
    [8, 9].forEach((v) => tree.insert(v)); //  right: 7 → 8 → 9
    // ...but node 2 now has left height 2 vs right height 0 → unbalanced
    expect(tree.isBalanced()).toBe(false);
  });

  test("deletions can unbalance a tree", () => {
    const tree = makeTree(SEVEN);
    [1, 2, 3].forEach((v) => tree.deleteItem(v)); // whole left side gone
    expect(tree.isBalanced()).toBe(false);
  });

  test("a chain of 3 is unbalanced", () => {
    expect(fromInserts([1, 2, 3]).isBalanced()).toBe(false);
  });

  test("does not change the tree", () => {
    const tree = makeTree(SEVEN);
    tree.isBalanced();
    expect(collect(tree, "preOrderForEach")).toEqual([4, 2, 1, 3, 6, 5, 7]);
  });
});

describe("rebalance", () => {
  test("makes an unbalanced tree balanced and keeps every value", () => {
    const tree = makeTree(SEVEN);
    [8, 9, 10, 11].forEach((v) => tree.insert(v));
    expect(tree.isBalanced()).toBe(false);

    tree.rebalance();

    expect(tree.isBalanced()).toBe(true);
    expect(inOrder(tree)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
  });

  test("the tree still works normally after rebalancing", () => {
    const tree = makeTree(SEVEN);
    [8, 9, 10].forEach((v) => tree.insert(v));
    tree.rebalance();

    tree.insert(12);
    tree.deleteItem(1);
    expect(tree.includes(12)).toBe(true);
    expect(tree.includes(1)).toBe(false);
    expect(inOrder(tree)).toEqual([2, 3, 4, 5, 6, 7, 8, 9, 10, 12]);
  });

  test("a chain of 15 becomes a perfect tree rooted at the middle value", () => {
    const chain = fromInserts(range(1, 15));
    expect(chain.height(1)).toBe(14);

    chain.rebalance();

    expect(rootValue(chain)).toBe(8);
    expect(chain.height(8)).toBe(3); // minimum height for 15 nodes
    expect(chain.isBalanced()).toBe(true);
    expect(collect(chain, "levelOrderForEachIterative").slice(0, 3)).toEqual([
      8, 4, 12,
    ]);
  });

  test("getRoot() reflects the new root after rebalancing", () => {
    const chain = fromInserts([1, 2, 3]);
    expect(rootValue(chain)).toBe(1);
    chain.rebalance();
    expect(rootValue(chain)).toBe(2);
  });

  test("rebalancing an already-balanced tree keeps it the same", () => {
    const tree = makeTree(SEVEN);
    tree.rebalance();
    expect(collect(tree, "preOrderForEach")).toEqual([4, 2, 1, 3, 6, 5, 7]);
  });

  test("rebalancing twice gives the same tree as rebalancing once", () => {
    const tree = fromInserts([5, 1, 9, 2, 8, 3, 7]);
    tree.rebalance();
    const once = collect(tree, "levelOrderForEachIterative");
    tree.rebalance();
    expect(collect(tree, "levelOrderForEachIterative")).toEqual(once);
  });

  test("rebalance after deletions", () => {
    const tree = makeTree(range(1, 15));
    [1, 2, 3, 4, 5, 6].forEach((v) => tree.deleteItem(v));
    tree.rebalance();
    expect(tree.isBalanced()).toBe(true);
    expect(inOrder(tree)).toEqual(range(7, 15));
  });
});

describe("random operations (seeded, so failures are repeatable)", () => {
  test("500 random inserts/deletes always match a Set of the same values", () => {
    const rand = rng(42);
    const tree = makeTree([]);
    const model = new Set();

    for (let i = 0; i < 500; i++) {
      const v = Math.floor(rand() * 50);
      if (rand() < 0.6) {
        tree.insert(v);
        model.add(v);
      } else {
        tree.deleteItem(v);
        model.delete(v);
      }
      expect(inOrder(tree)).toEqual(sortedUnique([...model]));
    }

    for (let v = 0; v < 50; v++) {
      expect(tree.includes(v)).toBe(model.has(v));
    }
  });

  test.each([1, 2, 3, 4, 5])(
    "seed %i: rebalance always gives a minimum-height balanced tree",
    (seed) => {
      const rand = rng(seed);
      const values = Array.from({ length: 40 }, () => Math.floor(rand() * 200));
      const tree = fromInserts(values);
      const expected = sortedUnique(values);

      tree.rebalance();

      expect(tree.isBalanced()).toBe(true);
      expect(inOrder(tree)).toEqual(expected);
      expect(tree.height(rootValue(tree))).toBe(minHeight(expected.length));
      expect(collect(tree, "levelOrderForEachRecursive")).toEqual(
        collect(tree, "levelOrderForEachIterative"),
      );
    },
  );
});

describe('driver script run-through (fixed "random" numbers, so the test is repeatable)', () => {
  test("balanced → unbalanced → rebalanced", () => {
    const numbers = [34, 7, 90, 12, 55, 3, 68, 21, 77, 41, 99, 15, 60, 8, 84];
    const tree = makeTree(numbers);
    expect(tree.isBalanced()).toBe(true);

    [101, 102, 103, 104, 105].forEach((v) => tree.insert(v)); // all > 100
    expect(tree.isBalanced()).toBe(false);

    tree.rebalance();
    expect(tree.isBalanced()).toBe(true);

    const expected = [...numbers, 101, 102, 103, 104, 105].sort(
      (a, b) => a - b,
    );
    expect(inOrder(tree)).toEqual(expected);
  });

  test("same run with an array from a random generator (numbers < 100)", () => {
    const rand = rng(2026);
    const numbers = Array.from({ length: 20 }, () => Math.floor(rand() * 100));
    const tree = makeTree(numbers);
    expect(tree.isBalanced()).toBe(true);

    range(101, 110).forEach((v) => tree.insert(v));
    expect(tree.isBalanced()).toBe(false);

    tree.rebalance();
    expect(tree.isBalanced()).toBe(true);
    expect(inOrder(tree)).toEqual(
      sortedUnique([...numbers, ...range(101, 110)]),
    );
  });
});
