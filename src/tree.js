import { Node } from "./node.js";

export function Tree(arr) {
  let root = null;

  const buildTree = function (array) {
    const cleanedArr = [...new Set(array)].sort((a, b) => a - b);

    const buildTreeHelper = function (arr, start, end) {
      if (start > end) return null;

      const mid = Math.floor(start + (end - start) / 2);
      const rootNode = Node(arr[mid]);

      rootNode.left = buildTreeHelper(arr, start, mid - 1);
      rootNode.right = buildTreeHelper(arr, mid + 1, end);

      return rootNode;
    };

    root = buildTreeHelper(cleanedArr, 0, cleanedArr.length - 1);
  };

  buildTree(arr);

  const getRoot = () => root;

  const includes = function (value) {
    if (root === null) {
      return false;
    }

    const includesHelper = function (root) {
      if (root === null) {
        return false;
      }
      if (root.data === value) {
        return true;
      }

      if (value > root.data) {
        return includesHelper(root.right);
      } else {
        return includesHelper(root.left);
      }
    };

    return includesHelper(root);
  };

  const insert = function (value) {
    // In case tree hasn't been built yet.
    if (root === null) {
      root = Node(value);
      return;
    }
    const insertHelper = function (current, parent, child = "") {
      if (current === null) {
        const newNode = Node(value);
        if (child === "left") {
          parent.left = newNode;
        } else if (child === "right") {
          parent.right = newNode;
        }
        return;
      }

      if (current.data === value) {
        return;
      }

      if (value < current.data) {
        insertHelper(current.left, current, "left");
      } else {
        insertHelper(current.right, current, "right");
      }
    };

    return insertHelper(root, null);
  };

  const deleteItem = function (value) {
    if (root === null) {
      return;
    }

    const getInOrderPredecessor = function (current) {
      current = current.left;
      while (current !== null && current.right !== null) {
        current = current.right;
      }
      // Predecessor is highest value in left subtree, or
      // the rightmost node in the left subtree
      return current;
    };

    const getInOrderSuccessor = function (current) {
      current = current.right;
      while (current !== null && current.left !== null) {
        current = current.left;
      }
      // Successor is smallest value in right subtree, or
      // the leftmost node in the right subtree
      return current;
    };

    const deleteHelper = function (current, parent, child = "") {
      // element is not in the list
      if (current === null) {
        return;
      }
      // target is found
      if (current.data === value) {
        // target is a leaf node
        if (current.left === null && current.right === null) {
          if (child === "left") {
            parent.left = null;
          } else if (child === "right") {
            parent.right = null;
          } else {
            if (parent === null) {
              root = null;
            } else {
              parent.right = null;
            }
            return;
          }
          return;
        }
        // target has left child only
        else if (current.right === null) {
          const tempLeft = current.left;
          if (child === "left") {
            parent.left = tempLeft;
          } else if (child === "right") {
            parent.right = tempLeft;
          }
          //   root only has left subtree
          else {
            const predecessor = getInOrderPredecessor(current);
            //   swap current and in-order predecessor
            const temp = current.data;
            current.data = predecessor.data;
            predecessor.data = temp;

            //   new value to remove
            value = temp;
            //   value to remove is in right subtree of current node
            deleteHelper(current.left, current, "left");
          }
          return;
        }
        // target has right child only
        else if (current.left === null) {
          const temp = current.right;
          if (child === "left") {
            parent.left = temp;
          } else if (child === "right") {
            parent.right = temp;
          } else {
            const successor = getInOrderSuccessor(current);

            //   swap current and in-order successor
            const temp = current.data;
            current.data = successor.data;
            successor.data = temp;

            //   new value to remove
            value = temp;
            //   value to remove is in right subtree of current node
            deleteHelper(current.right, current, "right");
            return;
          }
          return;
        }
        // target has two children
        else {
          const successor = getInOrderSuccessor(current);

          //   swap current and in-order successor
          const temp = current.data;
          current.data = successor.data;
          successor.data = temp;

          //   new value to remove
          value = temp;
          //   value to remove is in right subtree of current node
          deleteHelper(current.right, current, "right");
          return;
        }
      }

      if (value < current.data) {
        deleteHelper(current.left, current, "left");
      } else {
        deleteHelper(current.right, current, "right");
      }
    };

    return deleteHelper(root, null);
  };

  const levelOrderForEachIterative = function (callback) {
    if (callback === undefined) {
      throw new Error("Callback must be provided");
    }
    if (root === null) {
      return;
    }
    let Q = [];
    Q.push(root);

    while (Q.length !== 0) {
      const current = Q.shift();
      callback(current.data);

      if (current.left !== null) {
        Q.push(current.left);
      }
      if (current.right !== null) {
        Q.push(current.right);
      }
    }
  };

  const levelOrderForEachRecursive = function (callback) {
    if (callback === undefined) {
      throw new Error("Callback must be provided");
    }

    let levels = [];

    const traverse = function (node, level) {
      if (node === null) return;
      if (level === levels.length) levels.push([]);

      levels[level].push(node);
      traverse(node.left, level + 1);
      traverse(node.right, level + 1);
    };

    traverse(root, 0);

    const allNodeData = levels.flat().map((node) => node.data);
    allNodeData.forEach(callback);
  };

  const inOrderForEach = function (callback) {
    if (callback === undefined) {
      throw new Error("Callback must be provided");
    }

    const traverse = function (rootNode) {
      if (rootNode === null) return;

      traverse(rootNode.left);
      callback(rootNode.data);
      traverse(rootNode.right);
    };

    traverse(root);
  };

  const preOrderForEach = function (callback) {
    if (callback === undefined) {
      throw new Error("Callback must be provided");
    }

    const traverse = function (rootNode) {
      if (rootNode === null) return;

      callback(rootNode.data);
      traverse(rootNode.left);
      traverse(rootNode.right);
    };

    traverse(root);
  };

  const postOrderForEach = function (callback) {
    if (callback === undefined) {
      throw new Error("Callback must be provided");
    }

    const traverse = function (rootNode) {
      if (rootNode === null) return;

      traverse(rootNode.left);
      traverse(rootNode.right);
      callback(rootNode.data);
    };

    traverse(root);
  };

  const find = function (value) {
    const findHelper = function (root) {
      if (root === null) {
        return null;
      }
      if (root.data === value) {
        return root;
      }

      if (value > root.data) {
        return findHelper(root.right);
      } else {
        return findHelper(root.left);
      }
    };

    return findHelper(root);
  };

  const height = function (value) {
    const heightHelper = function (root) {
      if (root === null) return -1;

      const leftSubtree = 1 + heightHelper(root.left);
      const rightSubtree = 1 + heightHelper(root.right);

      return Math.max(leftSubtree, rightSubtree);
    };

    const target = find(value);

    return target !== null ? heightHelper(target) : undefined;
  };

  const depth = function (value) {
    const depthHelper = function (root, count) {
      if (root === null) {
        return 0;
      }
      if (root.data === value) {
        return count;
      }

      if (value > root.data) {
        return depthHelper(root.right, count + 1);
      } else {
        return depthHelper(root.left, count + 1);
      }
    };

    return includes(value) ? depthHelper(root, 0) : undefined;
  };

  const isBalanced = function () {
    const isBalancedHelper = function (node) {
      let leftHeight = -1;
      let rightHeight = -1;
      if (node.left) leftHeight = height(node.left.data);
      if (node.right) rightHeight = height(node.right.data);

      return Math.abs(leftHeight - rightHeight) <= 1;
    };

    const allNodesBalanced = [];
    const traverse = function (root) {
      if (root === null) return;

      traverse(root.left);
      const isSubtreeBalanced = isBalancedHelper(root);
      allNodesBalanced.push(isSubtreeBalanced);
      traverse(root.right);
    };

    traverse(root, 0);

    return allNodesBalanced.every((val) => val === true);
  };

  const rebalance = function () {
    if (isBalanced()) return;

    const allNodesData = [];
    const traverse = function (root) {
      if (root === null) return;

      traverse(root.left);
      allNodesData.push(root.data);
      traverse(root.right);
    };

    traverse(root);

    buildTree(allNodesData);
  };

  const prettyPrint = (node, prefix = "", isLeft = true) => {
    if (node === null || node === undefined) {
      return;
    }

    prettyPrint(node.right, `${prefix}${isLeft ? "│   " : "    "}`, false);
    console.log(`${prefix}${isLeft ? "└── " : "┌── "}${node.data}`);
    prettyPrint(node.left, `${prefix}${isLeft ? "    " : "│   "}`, true);
  };

  return {
    getRoot,
    buildTree,
    includes,
    insert,
    deleteItem,
    prettyPrint,
    levelOrderForEachIterative,
    levelOrderForEachRecursive,
    inOrderForEach,
    preOrderForEach,
    postOrderForEach,
    height,
    depth,
    isBalanced,
    rebalance,
  };
}
