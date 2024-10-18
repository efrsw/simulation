import { Link } from "./Link";
import { Node } from "./Node";

export class Graph {
    people: Node[] = [];
    foci: Node[] = [];
    links: Map<string, Link> = new Map();
    simulations: Map<string, Link>[] = [this.links];

    #numberOfPeople = 0;
    #numberOfFoci = 0;
    #numberOfSimulations = 0;

    // New connection probabilities
    #randomConnection = 0;
    #socialProbability = 0.25;
    #focalProbability = 0.3;
    #membershipClosureProbability = 0.25;
    #focalClosureProbability = 0.25;
    #triadicClosureProbability = 0.25;

    constructor(nPeople: number, nFoci: number, nSim: number) {
        this.#numberOfFoci = nFoci;
        this.#numberOfPeople = nPeople;
        this.#numberOfSimulations = nSim;
    }

    initializeGraph() {
        this.#generateNodes();
        this.#generateAllLinks();
        this.#initializeConnections();
        this.#fillSimulationsArray();
    }

    /**
     * Generate a series of state snapshots and mark possible connections.
     */
    #fillSimulationsArray() {
        for (let i = 1; i <= this.#numberOfSimulations; i++) {
            let newState = new Map(this.simulations[i - 1]);

            // Make all possible connections from the previous step 'present'
            this.#solidifyLinks(newState);

            for (let [key, value] of newState) {
                if (value.state === "present") continue;

                // Handle triadic closures
                for (let k = 0; k < this.#numberOfPeople; k++) {
                    /*
                     *  If the link with ID P0P2 (which means from Person 0 to Person 2) is subject to an increased
                     *  probability due to a triadic closure, than the dictionary with links will have links
                     *  P{k}P0 and P{k}P2.
                     */

                    if (
                        newState.get(`P${k}${value.source.id}`)?.state === "present" &&
                        newState.get(`P${k}${value.target.id}`)?.state === "present" &&
                        this.#triadicClosureProbability > Math.random()
                    ) {
                        newState.set(key, {
                            ...value,
                            state: "possible-triadic",
                        });
                    }
                }

                // Handle focal closure
                for (let k = 0; k < this.#numberOfPeople; k++) {
                    /*
                     *  If the link with ID P0P2 (which means from Person 0 to Person 2) is subject to an increased
                     *  probability due to a focal closure, than the dictionary with links will have links
                     *  F{k}P0 and F{k}P2.
                     */

                    if (
                        newState.get(`F${k}${value.source.id}`)?.state === "present" &&
                        newState.get(`F${k}${value.target.id}`)?.state === "present" &&
                        this.#focalClosureProbability > Math.random()
                    ) {
                        newState.set(key, {
                            ...value,
                            state: "possible-focal",
                        });
                    }
                }

                // Handle membership closure
                for (let k = 0; k < this.#numberOfPeople; k++) {
                    /*
                     *  If the link with ID P0F2 (which means from Person 0 to Foci 2) is subject to an increased
                     *  probability due to a membership closure, than the dictionary with links will have links
                     *  P{k}P0 and P{k}F2.
                     */

                    if (
                        newState.get(`P${k}${value.source.id}`)?.state === "present" &&
                        newState.get(`P${k}${value.target.id}`)?.state === "present" &&
                        this.#membershipClosureProbability > Math.random()
                    ) {
                        newState.set(key, {
                            ...value,
                            state: "possible-membership",
                        });
                    }
                }

                // There is some small probability, that connection will form randomly
                if (this.#randomConnection > Math.random()) {
                    newState.set(key, {
                        ...value,
                        state: "possible",
                    });
                }
            }

            this.simulations.push(newState);
        }

        // push final state with solidified links
        this.simulations.push(
            this.#solidifyLinks(this.simulations[this.simulations.length - 1]),
        );
    }

    /**
     * Form initial connections based on the given probability. This will be our initial socio-focal graph.
     */
    #initializeConnections() {
        for (let i of this.links.keys()) {
            let link = this.links.get(i)!;

            switch (link.target.type) {
                case "foci":
                    this.links.set(i, {
                        ...link,
                        state:
                            this.#focalProbability > Math.random() ? "present" : "absent",
                    });
                    break;
                case "person":
                    this.links.set(i, {
                        ...link,
                        state:
                            this.#socialProbability > Math.random() ? "present" : "absent",
                    });
            }
        }
    }

    /**
     * Generate all links in the 'absent' state, which means they won't be shown on a diagram.
     * This is helpful, because later we will move through states by snapshots.
     */
    #generateAllLinks() {
        let nodes = [...this.people, ...this.foci];
        for (let i = 0; i < nodes.length - 1; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                if (nodes[i].type === "person" && nodes[j].type === "foci") {
                    this.links.set(`${nodes[i].id}${nodes[j].id}`, {
                        id: `${nodes[i].id}${nodes[j].id}`,
                        source: nodes[i],
                        target: nodes[j],
                        state: "absent",
                    });
                } else if (nodes[i].type === "person" && nodes[j].type === "person") {
                    this.links.set(`${nodes[i].id}${nodes[j].id}`, {
                        id: `${nodes[i].id}${nodes[j].id}`,
                        source: nodes[i],
                        target: nodes[j],
                        state: "absent",
                    });
                }
            }
        }
    }

    /**
     * Initialize nodes based on required amounts.
     */
    #generateNodes() {
        // Generate some people
        for (let i = 0; i < this.#numberOfPeople; i++) {
            this.people.push({
                id: `P${i}`,
                type: "person",
            });
        }

        // Generate foci
        for (let i = 0; i < this.#numberOfFoci; i++) {
            this.foci.push({
                id: `F${i}`,
                type: "foci",
            });
        }
    }

    #solidifyLinks(links: Map<string, Link>) {
        links.forEach((value, key) => {
            links.set(key, {
                ...value,
                state: value.state !== "absent" ? "present" : "absent",
            });
        });

        return links;
    }
}
