import { Node } from "./Node";

export type Link = {
    id: string,
    source: Node;
    target: Node;
    visible: LinkState;
};

type LinkState = 
    | "absent"
    | "possible"
    | "possible-triadic"
    | "possible-focal"
    | "possible-membership"
    | "present"

