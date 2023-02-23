import {
  LexicalNode,
  createCommand,
  LexicalCommand,
  $isElementNode,
  $getSelection,
  EditorConfig,
  $setSelection,
  ElementNode,
  NodeKey,
} from "lexical";
import { LinkNode } from "@lexical/link";
import utils from "@lexical/utils";

export interface LinkCustomizationAttributes {
  url: string;
  target?: string;
  classNames?: Array<string>;
}

export class CustomLinkNode extends LinkNode {
  __url: string;
  __target: string;
  __classNames: Array<string>;
  __setfoo: (value: Array<string>) => void;
  constructor(
    url: string,
    target: string,
    classNames: Array<string>,
    key?: NodeKey
  ) {
    super(url, { target });
    this.__url = url || "https://";
    this.__target = target || "_self";
    this.__classNames = classNames || [];
    this.__setfoo = function (value: Array<string>) {
      this.getWritable().__classNames = value
        .join(" ")
        .split(" ")
        .filter((v: string) => v !== " ");
    };
  }

  static getType() {
    return "custom-link";
  }

  createDOM() {
    const link = document.createElement("a");

    link.href = this.__url;

    link.setAttribute("target", this.__target || "_blank");

    utils.addClassNamesToElement(link, (this.__classNames || []).join(" "));

    return link;
  }
  /*
  throws an error https://github.com/facebook/lexical/issues/3962
  static clone(node: LinkNode): LinkNode {
    console.log('clone');
    return new CustomLinkNode(
      node.__url,
      node.__target,
      node.__classNames,
      node.__key,
    );
  }*/

  __setfoo(value: Array<string>) {
    console.log("classname", value);
    const writable = this.getWritable();

    writable.__classNames = value
      .join(" ")
      .split(" ")
      .filter((v: string) => v !== " ");

    return null;
  }

  updateDOM() {
    return false;
  }
}

export const TOGGLE_CUSTOM_LINK_NODE_COMMAND: LexicalCommand<LinkCustomizationAttributes> =
  createCommand();

export function $createCustomLinkNode(
  url: string,
  target: string,
  classNames: Array<string>
): CustomLinkNode {
  return new CustomLinkNode(url, target, classNames);
}

export function $isCustomLinkNode(
  node: LexicalNode | null | undefined | any
): node is CustomLinkNode {
  return node instanceof LinkNode;
}

export function toggleCustomLinkNode({
  url,
  target = "_blank",
  classNames = [],
  getNodeByKey,
}: LinkCustomizationAttributes & {
  getNodeByKey: (key: NodeKey) => HTMLElement | null;
}): void {
  const selection = $getSelection();

  if (selection !== null) {
    $setSelection(selection);
  }

  const sel = $getSelection();

  const addAttributesToLinkNode = (linkNode: CustomLinkNode) => {
    const dom = getNodeByKey(linkNode.getKey());

    console.log(linkNode, "dom", dom);

    if (!dom) return;

    const uniqueClassNames = new Set([
      ...dom.getAttribute("class").split(" "),
      ...classNames,
    ]);

    console.log("classnames", Array.from(uniqueClassNames));

    linkNode.setURL(url);
    linkNode.setTarget(target);
    linkNode.__setfoo(Array.from(uniqueClassNames));

    setTimeout(() => {
      dom.setAttribute("href", url);
      dom.setAttribute("target", target);

      utils.addClassNamesToElement(dom, classNames.join(" "));
    }, 100);
  };

  if (sel !== null) {
    const nodes = sel.extract();

    if (url === null) {
      nodes.forEach((node) => {
        const parent = node.getParent();

        if ($isCustomLinkNode(parent)) {
          const children = parent.getChildren();

          for (let i = 0; i < children.length; i++) {
            parent.insertBefore(children[i]);
          }

          addAttributesToLinkNode(parent);

          parent.remove();
        }
      });
    } else {
      if (nodes.length === 1) {
        const firstNode = nodes[0];

        if ($isCustomLinkNode(firstNode)) {
          addAttributesToLinkNode(firstNode);
          return;
        } else {
          const parent = firstNode.getParent();

          if ($isCustomLinkNode(parent)) {
            addAttributesToLinkNode(parent);
            return;
          }
        }
      }

      let prevParent: ElementNode | null = null;
      let linkNode: CustomLinkNode | null = null;

      nodes.forEach((node) => {
        const parent = node.getParent();

        if (
          parent === linkNode ||
          parent === null ||
          ($isElementNode(node) && !node.isInline())
        ) {
          return;
        }

        if ($isCustomLinkNode(parent)) {
          linkNode = parent;
          addAttributesToLinkNode(linkNode);
          return;
        }

        if (!parent.is(prevParent)) {
          prevParent = parent;
          linkNode = $createCustomLinkNode(url, target, classNames);

          if (!linkNode) return;

          if ($isCustomLinkNode(parent)) {
            if (node.getPreviousSibling() === null) {
              parent.insertBefore(linkNode);
            } else {
              parent.insertAfter(linkNode);
            }
          } else {
            node.insertBefore(linkNode);
          }
        }

        if (!linkNode) return;

        if ($isCustomLinkNode(linkNode)) {
          addAttributesToLinkNode(linkNode);
        }

        if ($isCustomLinkNode(node)) {
          if (node.is(linkNode)) {
            return;
          }
          if (linkNode !== null) {
            const children = node.getChildren();

            for (let i = 0; i < children.length; i++) {
              linkNode.append(children[i]);
            }
          }

          node.remove();
          return;
        }

        if (linkNode !== null) {
          linkNode.append(node);
        }
      });
    }
  }
}
